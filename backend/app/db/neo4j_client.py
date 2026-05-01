"""
Neo4j Graph Database Integration
"""
from neo4j import GraphDatabase
import os
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

class Neo4jClient:
    def __init__(self):
        self.driver = None
        self.connected = False
        
    def connect(self):
        """Connect to Neo4j"""
        try:
            uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
            user = os.getenv("NEO4J_USER", "neo4j")
            password = os.getenv("NEO4J_PASSWORD", "password")
            
            self.driver = GraphDatabase.driver(uri, auth=(user, password))
            
            # Test connection
            with self.driver.session() as session:
                result = session.run("RETURN 1 as test")
                result.single()
            
            self.connected = True
            logger.info(f"Connected to Neo4j at {uri}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to Neo4j: {e}")
            self.connected = False
            return False
    
    def add_node(self, node_id: str, node_type: str = "Concept", properties: Optional[Dict] = None):
        """Add a node to the graph"""
        try:
            if not self.connected:
                return False
                
            with self.driver.session() as session:
                props = properties or {}
                props['id'] = node_id
                props['type'] = node_type
                
                query = f"""
                MERGE (n:{node_type} {{id: $id}})
                SET n += $props
                RETURN n
                """
                
                session.run(query, id=node_id, props=props)
                logger.debug(f"Added node: {node_id}")
                return True
                
        except Exception as e:
            logger.error(f"Error adding node: {e}")
            return False
    
    def add_relationship(self, source_id: str, target_id: str, rel_type: str = "RELATES_TO", properties: Optional[Dict] = None):
        """Add a relationship between two nodes"""
        try:
            if not self.connected:
                return False
                
            with self.driver.session() as session:
                props = properties or {}
                
                query = f"""
                MATCH (a {{id: $source_id}})
                MATCH (b {{id: $target_id}})
                MERGE (a)-[r:{rel_type}]->(b)
                SET r += $props
                RETURN r
                """
                
                session.run(query, source_id=source_id, target_id=target_id, props=props)
                logger.debug(f"Added relationship: {source_id} -> {target_id}")
                return True
                
        except Exception as e:
            logger.error(f"Error adding relationship: {e}")
            return False
    
    def get_graph(self) -> Dict:
        """Get the entire graph structure"""
        try:
            if not self.connected:
                return {"nodes": [], "links": []}
                
            with self.driver.session() as session:
                # Get all nodes
                nodes_result = session.run("""
                    MATCH (n)
                    RETURN n.id as id, n.type as type, labels(n) as labels
                """)
                
                nodes = []
                for record in nodes_result:
                    nodes.append({
                        "id": record["id"],
                        "group": hash(record["type"]) % 10 if record["type"] else 0,
                        "val": 5
                    })
                
                # Get all relationships
                rels_result = session.run("""
                    MATCH (a)-[r]->(b)
                    RETURN a.id as source, b.id as target, type(r) as type
                """)
                
                links = []
                for record in rels_result:
                    links.append({
                        "source": record["source"],
                        "target": record["target"]
                    })
                
                return {"nodes": nodes, "links": links}
                
        except Exception as e:
            logger.error(f"Error getting graph: {e}")
            return {"nodes": [], "links": []}
    
    def find_related_concepts(self, concept_id: str, max_depth: int = 2) -> List[str]:
        """Find concepts related to a given concept"""
        try:
            if not self.connected:
                return []
                
            with self.driver.session() as session:
                query = """
                MATCH path = (start {id: $concept_id})-[*1..%d]-(related)
                RETURN DISTINCT related.id as id
                LIMIT 20
                """ % max_depth
                
                result = session.run(query, concept_id=concept_id)
                
                related = [record["id"] for record in result if record["id"]]
                return related
                
        except Exception as e:
            logger.error(f"Error finding related concepts: {e}")
            return []
    
    def clear_graph(self):
        """Clear all nodes and relationships"""
        try:
            if not self.connected:
                return False
                
            with self.driver.session() as session:
                session.run("MATCH (n) DETACH DELETE n")
                logger.info("Cleared Neo4j graph")
                return True
                
        except Exception as e:
            logger.error(f"Error clearing graph: {e}")
            return False
    
    def close(self):
        """Close Neo4j connection"""
        if self.driver:
            self.driver.close()
            self.connected = False
            logger.info("Closed Neo4j connection")

# Global instance
neo4j_client = Neo4jClient()
