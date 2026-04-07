import unittest
from src.draw_engine.materials.software_engineering import (
    EREntity,
    ERRelation,
    ERAttribute,
    UseCaseActor,
    UMLClass
)

class TestSoftwareEngineering(unittest.TestCase):
    def test_er_entity(self):
        entity = EREntity(cx=100, cy=100, text="User")
        bounds = entity.anchors()
        self.assertIn('top', bounds)
        self.assertIn('bottom', bounds)
        self.assertIn('left', bounds)
        self.assertIn('right', bounds)
        self.assertIn('center', bounds)

    def test_er_relation(self):
        relation = ERRelation(cx=200, cy=200, text="Buys")
        bounds = relation.anchors()
        self.assertIn('top', bounds)
        self.assertIn('bottom', bounds)
        self.assertIn('left', bounds)
        self.assertIn('right', bounds)
        self.assertIn('center', bounds)

    def test_er_attribute(self):
        attribute = ERAttribute(cx=300, cy=300, text="id")
        bounds = attribute.anchors()
        self.assertIn('top', bounds)
        self.assertIn('bottom', bounds)
        self.assertIn('left', bounds)
        self.assertIn('right', bounds)
        self.assertIn('center', bounds)

    def test_use_case_actor(self):
        actor = UseCaseActor(cx=400, cy=400, text="Admin")
        bounds = actor.anchors()
        self.assertIn('top', bounds)
        self.assertIn('bottom', bounds)
        self.assertIn('left', bounds)
        self.assertIn('right', bounds)
        self.assertIn('center', bounds)

    def test_uml_class(self):
        uml = UMLClass(cx=500, cy=500, class_name="User", attributes=["id: int", "name: str"], methods=["save()"])
        bounds = uml.anchors()
        self.assertIn('top', bounds)
        self.assertIn('bottom', bounds)
        self.assertIn('left', bounds)
        self.assertIn('right', bounds)
        self.assertIn('center', bounds)

if __name__ == '__main__':
    unittest.main()
