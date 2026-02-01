import json
import sys
import inspect
from pathlib import Path

def main():
    try:
        code_file = Path("/sandbox/code.py")
        tests_file = Path("/sandbox/tests.json")

        if not code_file.exists() or not tests_file.exists():
            print(json.dumps([{"passed": False, "error": "Internal error: files not found"}]))
            sys.exit(1)

        user_code = code_file.read_text(encoding="utf-8")
        tests = json.loads(tests_file.read_text(encoding="utf-8"))

        # Пространство имен для выполнения кода
        namespace = {}
        try:
            exec(user_code, namespace)
        except Exception as e:
            print(json.dumps([{"passed": False, "error": f"Syntax error: {e}"}]))
            return

        # Ищем функцию (solve или любую другую)
        user_func = namespace.get("solve")
        if not user_func:
            # Если solve нет, берем первую попавшуюся функцию пользователя
            funcs = [obj for name, obj in namespace.items() 
                     if inspect.isfunction(obj) and obj.__module__ is None]
            if funcs:
                user_func = funcs[0]

        if not user_func:
            print(json.dumps([{"passed": False, "error": "Function not found. Use: def solve(a, b):"}]))
            return

        results = []
        for i, test in enumerate(tests):
            variables = test.get("variables", {})
            expected = test.get("expected")
            try:
                # ВЫЗЫВАЕМ ФУНКЦИЮ
                actual = user_func(**variables)
                results.append({
                    "test_num": i + 1,
                    "passed": actual == expected,
                    "expected": expected,
                    "actual": actual
                })
            except Exception as e:
                results.append({
                    "test_num": i + 1,
                    "passed": False,
                    "error": str(e)
                })

        print(json.dumps(results))

    except Exception as e:
        print(json.dumps([{"passed": False, "error": str(e)}]))

if __name__ == "__main__":
    main()