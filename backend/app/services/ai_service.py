import base64
import fitz  # PyMuPDF
from openai import OpenAI
from typing import List, Dict, Any
from app.core.config import settings
from app.models.comic import ComicMetadata, ComicPage, ComicPanel


class AIService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)
    
    def process_comic_pdf(self, pdf_path: str, comic_title: str) -> ComicMetadata:
        """Process PDF comic and extract characters, panels, and dialogue using GPT-4V"""
        
        # Extract pages from PDF
        pages_data = self._extract_pages_from_pdf(pdf_path)
        
        # Process each page with AI
        processed_pages = []
        all_characters = set()
        
        for page_num, page_image in enumerate(pages_data, 1):
            page_analysis = self._analyze_page_with_ai(page_image, comic_title, page_num)
            processed_pages.append(page_analysis["page"])
            all_characters.update(page_analysis["characters"])
        
        # Determine comic style and reading direction
        style_analysis = self._determine_comic_style(pages_data[0] if pages_data else None, comic_title)
        
        return ComicMetadata(
            title=comic_title,
            characters=list(all_characters),
            reading_direction=style_analysis["reading_direction"],
            style=style_analysis["style"],
            pages=processed_pages
        )
    
    def _extract_pages_from_pdf(self, pdf_path: str) -> List[str]:
        """Extract pages from PDF as base64 encoded images"""
        pages = []
        
        try:
            doc = fitz.open(pdf_path)
            for page_num in range(doc.page_count):
                page = doc[page_num]
                # Convert page to image
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x scale for better quality
                img_data = pix.tobytes("png")
                
                # Convert to base64
                img_base64 = base64.b64encode(img_data).decode()
                pages.append(img_base64)
            
            doc.close()
        except Exception as e:
            raise Exception(f"Error processing PDF: {str(e)}")
        
        return pages
    
    def _analyze_page_with_ai(self, page_image: str, comic_title: str, page_num: int) -> Dict[str, Any]:
        """Analyze a single comic page using GPT-4V"""
        
        prompt = f"""
        Analyze this comic page from "{comic_title}" (page {page_num}).
        
        Please identify:
        1. All panels in reading order
        2. All speech bubbles, thought bubbles, narration boxes, and sound effects
        3. Which character is speaking/thinking (if identifiable)
        4. The exact text in each bubble
        
        Return a JSON response with this structure:
        {{
            "page_number": {page_num},
            "panels": [
                {{
                    "panel_id": "p{page_num}_1",
                    "order": 1,
                    "bubbles": [
                        {{
                            "bubble_id": "b{page_num}_1_1",
                            "text": "exact text here",
                            "order": 1,
                            "character": "character name or 'unknown'",
                            "bubble_type": "speech|thought|narration|sound"
                        }}
                    ]
                }}
            ],
            "characters_on_page": ["list", "of", "character", "names"]
        }}
        
        If no text is present in a panel, describe the action for narration.
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompt
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{page_image}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            
            import json
            result = json.loads(response.choices[0].message.content)
            
            # Convert to our data models
            panels = []
            for panel_data in result.get("panels", []):
                panel = ComicPanel(
                    panel_id=panel_data["panel_id"],
                    order=panel_data["order"],
                    bubbles=panel_data["bubbles"]
                )
                panels.append(panel)
            
            page = ComicPage(
                page_number=page_num,
                panels=panels
            )
            
            return {
                "page": page,
                "characters": result.get("characters_on_page", [])
            }
            
        except Exception as e:
            # Fallback for AI failures
            return {
                "page": ComicPage(
                    page_number=page_num,
                    panels=[
                        ComicPanel(
                            panel_id=f"p{page_num}_1",
                            order=1,
                            bubbles=[{
                                "bubble_id": f"b{page_num}_1_1",
                                "text": f"Page {page_num} content (AI processing failed)",
                                "order": 1,
                                "character": "Narrator",
                                "bubble_type": "narration"
                            }]
                        )
                    ]
                ),
                "characters": ["Narrator"]
            }
    
    def _determine_comic_style(self, first_page_image: str, comic_title: str) -> Dict[str, str]:
        """Determine if comic is Western or Manga style"""
        
        if not first_page_image:
            return {"reading_direction": "ltr", "style": "western"}
        
        prompt = """
        Analyze this comic page and determine:
        1. Is this a Western comic (left-to-right reading) or Manga (right-to-left reading)?
        2. What is the art style - western, manga, or hybrid?
        
        Return JSON:
        {
            "reading_direction": "ltr" or "rtl",
            "style": "western" or "manga"
        }
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompt
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{first_page_image}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=200,
                response_format={"type": "json_object"}
            )
            
            import json
            return json.loads(response.choices[0].message.content)
            
        except Exception:
            # Default fallback
            return {"reading_direction": "ltr", "style": "western"}


# Global AI service instance
ai_service = AIService()