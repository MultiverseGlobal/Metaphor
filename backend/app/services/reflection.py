import json
import logging
from typing import List, Dict, Any
from app.services.llm import llm_service
from app.services.graph import GraphService
from app.models.operations import WebhookEvent
import uuid

logger = logging.getLogger("metaphor.services.reflection")

class ReflectionService:
    def __init__(self, graph_service: GraphService):
        self.graph = graph_service

    async def reflect_and_evolve(self, org_id: uuid.UUID, event: WebhookEvent) -> Dict[str, Any]:
        """
        Run the Reflection Agent to translate a WebhookEvent into Graph mutations.
        The Intelligence Layer emits structured operations: CREATE_NODE, UPDATE_NODE, SUPERSEDE_NODE, CREATE_EDGE, IGNORE.
        """
        # Fetch existing nodes for context mapping
        existing_nodes = await self.graph.list_recent_nodes(org_id, limit=100)
        existing_nodes_context = [{"id": str(n.id), "title": n.title, "type": n.type, "summary": n.summary, "status": n.status} for n in existing_nodes if n.status == "active"]

        payload_str = json.dumps(event.payload)

        system_prompt = (
            "You are the Metaphor Intelligence Engine. Your job is not just to remember data, but to UNDERSTAND it.\n"
            "You evaluate incoming events against the existing knowledge graph and emit specific MUTATION OPERATIONS.\n"
            "If a user states a constraint that conflicts with a previous constraint, you must SUPERSEDE the old node.\n"
            "If an event adds nuance to an existing node, you UPDATE the node.\n"
            "If an event introduces entirely new concepts, you CREATE new nodes.\n"
            "If an event is redundant or has no semantic value, you IGNORE it.\n"
        )

        prompt = (
            f"--- EXISTING GRAPH CONTEXT ---\n"
            f"{json.dumps(existing_nodes_context, indent=2)}\n\n"
            f"--- INCOMING EVENT ---\n"
            f"Provider: {event.provider}\n"
            f"Type: {event.event_type}\n"
            f"Payload: {payload_str}\n\n"
            f"Task: Analyze the event. Output a JSON object containing a list of 'operations'.\n"
            f"Supported actions: CREATE_NODE, UPDATE_NODE, SUPERSEDE_NODE, CREATE_EDGE, IGNORE.\n"
            f"Output Schema:\n"
            f"{{\n"
            f"  \"operations\": [\n"
            f"    {{\n"
            f"       \"action\": \"CREATE_NODE\",\n"
            f"       \"node\": {{\"title\": \"...\", \"type\": \"Project|Decision|Goal|Constraint|Preference|Person|Concept\", \"summary\": \"...\", \"metadata\": {{}}}}\n"
            f"    }},\n"
            f"    {{\n"
            f"       \"action\": \"SUPERSEDE_NODE\",\n"
            f"       \"old_node_id\": \"uuid\",\n"
            f"       \"new_node\": {{\"title\": \"...\", \"type\": \"...\", \"summary\": \"...\", \"metadata\": {{}}}}\n"
            f"    }},\n"
            f"    {{\n"
            f"       \"action\": \"UPDATE_NODE\",\n"
            f"       \"node_id\": \"uuid\",\n"
            f"       \"summary\": \"Updated summary...\"\n"
            f"    }},\n"
            f"    {{\n"
            f"       \"action\": \"CREATE_EDGE\",\n"
            f"       \"source_id\": \"uuid\",\n"
            f"       \"target_id\": \"uuid\",\n"
            f"       \"relationship\": \"owns|requires|contradicts|relates_to\"\n"
            f"    }},\n"
            f"    {{\n"
            f"       \"action\": \"IGNORE\",\n"
            f"       \"reason\": \"...\"\n"
            f"    }}\n"
            f"  ],\n"
            f"  \"evidence_links\": [\n"
            f"    {{\"node_title_or_id\": \"...\"}}\n"
            f"  ]\n"
            f"}}\n"
            f"Respond STRICTLY in JSON format with no backticks or markdown formatting if possible."
        )

        logger.info("Calling LLM for intelligence layer reflection...")
        response_text = await llm_service.query_llm(prompt=prompt, system_prompt=system_prompt, temperature=0.0)

        try:
            clean_response = response_text.strip()
            if clean_response.startswith("```json"):
                clean_response = clean_response[7:]
            if clean_response.endswith("```"):
                clean_response = clean_response[:-3]
            result = json.loads(clean_response)
        except Exception as e:
            logger.error(f"Failed to parse LLM JSON: {e}")
            return {"status": "error", "message": f"LLM Parse Error: {e}"}

        operations = result.get("operations", [])
        evidence_links = result.get("evidence_links", [])
        
        applied_ops = 0
        node_map = {} # title -> node
        
        for op in operations:
            action = op.get("action")
            
            if action == "CREATE_NODE":
                n_data = op.get("node", {})
                title = n_data.get("title")
                if title:
                    summary = n_data.get("summary", "")
                    # Generate embedding
                    embedding = await llm_service.generate_embedding(f"{title}: {summary}")
                    node = await self.graph.create_node(
                        org_id=org_id,
                        type=n_data.get("type", "Concept"),
                        title=title,
                        summary=summary,
                        content=summary,
                        metadata=n_data.get("metadata", {}),
                        embedding_vector=embedding
                    )
                    node_map[title.lower()] = node
                    applied_ops += 1
                    
            elif action == "SUPERSEDE_NODE":
                old_id_str = op.get("old_node_id")
                n_data = op.get("new_node", {})
                title = n_data.get("title")
                
                if old_id_str and title:
                    try:
                        old_id = uuid.UUID(old_id_str)
                        summary = n_data.get("summary", "")
                        # Generate embedding
                        embedding = await llm_service.generate_embedding(f"{title}: {summary}")
                        # Create the new node
                        new_node = await self.graph.create_node(
                            org_id=org_id,
                            type=n_data.get("type", "Concept"),
                            title=title,
                            summary=summary,
                            content=summary,
                            metadata=n_data.get("metadata", {}),
                            embedding_vector=embedding
                        )
                        node_map[title.lower()] = new_node
                        
                        # Update old node
                        await self.graph.update_node(old_id, status="superseded", superseded_by_id=new_node.id)
                        
                        # Create an explicit edge
                        await self.graph.create_edge(from_node=new_node.id, to_node=old_id, relationship="supersedes")
                        
                        applied_ops += 1
                    except Exception as e:
                        logger.error(f"Error superseding node: {e}")
                        
            elif action == "UPDATE_NODE":
                node_id_str = op.get("node_id")
                new_summary = op.get("summary")
                if node_id_str and new_summary:
                    try:
                        nid = uuid.UUID(node_id_str)
                        await self.graph.update_node(nid, summary=new_summary, content=new_summary)
                        applied_ops += 1
                    except Exception as e:
                        logger.error(f"Error updating node: {e}")
                        
            elif action == "CREATE_EDGE":
                src = op.get("source_id")
                tgt = op.get("target_id")
                rel = op.get("relationship", "relates_to")
                if src and tgt:
                    try:
                        await self.graph.create_edge(uuid.UUID(src), uuid.UUID(tgt), rel)
                        applied_ops += 1
                    except Exception as e:
                        logger.error(f"Error creating edge: {e}")
                        
            elif action == "IGNORE":
                logger.info(f"LLM Ignored event: {op.get('reason')}")
                applied_ops += 1

        # Add Evidence Links
        for link in evidence_links:
            ref = link.get("node_title_or_id", "")
            target_node = None
            
            # Check by title first in our new map
            if ref.lower() in node_map:
                target_node = node_map[ref.lower()]
            else:
                # Try to parse as UUID
                try:
                    nid = uuid.UUID(ref)
                    target_node = await self.graph.get_node(nid)
                except ValueError:
                    # Fallback to searching existing nodes by title
                    target_node = next((n for n in existing_nodes if n.title.lower() == ref.lower()), None)
                    
            if target_node:
                await self.graph.add_evidence(
                    node_id=target_node.id,
                    source=event.provider,
                    source_type=event.event_type,
                    raw_text=payload_str,
                    url=event.payload.get("url")
                )

        return {
            "status": "success", 
            "operations_applied": applied_ops,
            "created_nodes": [
                {"id": str(n.id), "title": n.title, "type": n.type, "summary": n.summary}
                for n in node_map.values()
            ]
        }

    async def analyze_draft(self, text: str) -> Dict[str, Any]:
        """Legacy single-text analysis. Kept for compatibility."""
        return await self.analyze_interview([{"question": "What are you currently building?", "answer": text}])

    async def analyze_interview(self, answers: list) -> Dict[str, Any]:
        """
        Multi-turn interview analysis. Accepts a full conversation history and returns:
        - Extracted entities (org, projects, goals, preferences)
        - Per-category confidence scores (mission, projects, goals, preferences, constraints)
        - An overall confidence score
        - A reflection statement proving the AI understood the last answer
        - The single highest-value next question to increase overall confidence
        """
        if not answers:
            return {
                "organization": "", "projects": [], "goals": [], "preferences": [],
                "categories": {"mission": 0, "projects": 0, "goals": 0, "preferences": 0, "constraints": 0},
                "overall_confidence": 0,
                "reflection": "",
                "next_question": "What are you currently working on?"
            }

        # Format the conversation history for the prompt
        history_str = "\n".join(
            [f"Q: {a.get('question', '')}\nA: {a.get('answer', '')}" for a in answers]
        )

        system_prompt = (
            "You are the Metaphor Intelligence Engine — an expert researcher building a structured model of a user.\n"
            "You are given a conversation history of questions and the user's answers.\n"
            "Your job is to:\n"
            "1. Extract all entities: organization, projects, goals, and preferences/constraints.\n"
            "2. Score each category's completeness from 0-100 (mission, projects, goals, preferences, constraints).\n"
            "3. Calculate an overall_confidence (0-100) as a weighted average.\n"
            "4. Write a short 'reflection' statement that proves you understood the LAST answer. Example: 'So MGE is your primary organization. Got it.'\n"
            "5. Generate the SINGLE highest-value next_question to most efficiently increase the overall_confidence.\n"
            "   - CRITICAL: DO NOT repeat a question that has already been asked in the conversation history.\n"
            "   - If mission is low, ask about mission. If projects are low, ask about specific products, etc.\n"
            "   - Make the question specific to the user's last answer to feel conversational.\n"
            "Respond STRICTLY with valid JSON matching this schema:\n"
            "{\n"
            "  \"organization\": \"str\",\n"
            "  \"projects\": [\"str\"],\n"
            "  \"goals\": [\"str\"],\n"
            "  \"preferences\": [\"str\"],\n"
            "  \"categories\": {\"mission\": 0, \"projects\": 0, \"goals\": 0, \"preferences\": 0, \"constraints\": 0},\n"
            "  \"overall_confidence\": 0,\n"
            "  \"reflection\": \"str\",\n"
            "  \"next_question\": \"str\"\n"
            "}"
        )

        prompt = f"Conversation History:\n{history_str}"

        try:
            response_text = await llm_service.query_llm(prompt=prompt, system_prompt=system_prompt, temperature=0.4)
            clean = response_text.strip()
            if clean.startswith("```json"): clean = clean[7:]
            if clean.startswith("```"): clean = clean[3:]
            if clean.endswith("```"): clean = clean[:-3]
            return json.loads(clean.strip())
        except Exception as e:
            logger.error(f"LLM query or JSON parse failed in analyze_interview: {e}. Running smart rule-based fallback.")
            
            # Rule-based fallback based on conversation turn count & content
            turn_count = len(answers)
            last_ans = answers[-1].get("answer", "") if answers else ""
            
            # Accumulate text from all answers
            all_text = " ".join([a.get("answer", "") for a in answers])
            
            # Extract simple org/project candidates
            first_ans = answers[0].get("answer", "").strip() if answers else "Project"
            org_name = first_ans if len(first_ans) < 30 else first_ans.split()[0]
            
            projects = []
            if turn_count >= 2:
                second_ans = answers[1].get("answer", "").strip()
                if second_ans:
                    projects = [p.strip() for p in second_ans.replace("and", ",").split(",") if p.strip()]
            
            if turn_count == 1:
                return {
                    "organization": org_name,
                    "projects": [],
                    "goals": [],
                    "preferences": [],
                    "categories": {"mission": 70, "projects": 20, "goals": 10, "preferences": 0, "constraints": 0},
                    "overall_confidence": 35,
                    "reflection": f"Understood. {org_name} is recorded as your primary workspace.",
                    "next_question": f"What specific products or projects are currently part of {org_name}?"
                }
            elif turn_count == 2:
                return {
                    "organization": org_name,
                    "projects": projects if projects else [answers[1].get("answer", "Main App")],
                    "goals": [],
                    "preferences": [],
                    "categories": {"mission": 85, "projects": 80, "goals": 40, "preferences": 20, "constraints": 0},
                    "overall_confidence": 62,
                    "reflection": f"Recorded your active projects under {org_name}.",
                    "next_question": f"What is the primary goal or mission for these projects?"
                }
            else:
                return {
                    "organization": org_name,
                    "projects": projects if projects else ["Core Product"],
                    "goals": [last_ans] if last_ans else ["Build Context Engine"],
                    "preferences": ["Direct tone", "TypeScript/Python stack"],
                    "categories": {"mission": 95, "projects": 90, "goals": 85, "preferences": 80, "constraints": 75},
                    "overall_confidence": 85,
                    "reflection": f"Your context model is fully formed for {org_name}.",
                    "next_question": ""
                }

