# game_service/game_app/tests.py
from django.test import TestCase
from .sandbox.sandbox import run_in_sandbox

class SandboxTest(TestCase):
    
    def test_correct_solution(self):
        result = run_in_sandbox(
            "def solve(a, b): return a + b",
            [{"variables": {"a": 1, "b": 2}, "expected": 3}]
        )
        self.assertTrue(result["output"][0]["passed"])

    def test_wrong_solution(self):
        result = run_in_sandbox(
            "def solve(a, b): return a - b",
            [{"variables": {"a": 1, "b": 2}, "expected": 3}]
        )
        self.assertFalse(result["output"][0]["passed"])

    def test_syntax_error(self):
        result = run_in_sandbox(
            "def solve(a, b) return a + b",  # нет двоеточия
            [{"variables": {"a": 1, "b": 2}, "expected": 3}]
        )
        self.assertIn("error", result)

    def test_timeout(self):
        result = run_in_sandbox(
            "def solve(a, b):\n    while True: pass",  # бесконечный цикл
            [{"variables": {"a": 1, "b": 2}, "expected": 3}]
        )
        self.assertIn("error", result)