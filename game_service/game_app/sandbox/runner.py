import json
import sys
from pathlib import Path

def main():
    try:
        code_file = Path("/sandbox/code.py")
        tests_file = Path("/sandbox/tests.json")

        if not code_file.exists():
            print(json.dumps([{"passed": False, "error": "code.py not found"}]))
            sys.exit(1)
        
        if not tests_file.exists():
            print(json.dumps([{"passed": False, "error": "tests.json not found"}]))
            sys.exit(1)

        user_code = code_file.read_text(encoding="utf-8")
        tests = json.loads(tests_file.read_text(encoding="utf-8"))

        if not isinstance(tests, list):
            print(json.dumps([{"passed": False, "error": f"tests должен быть списком, получен {type(tests).__name__}"}]))
            sys.exit(1)

        results = []

        # Проверяем каждый тест
        for i, test in enumerate(tests):
            variables = test.get("variables", {})
            expected = test.get("expected")
            passed = False
            test_error = None
            actual_result = None

            try:
                # Создаем namespace с переменными
                namespace = variables.copy()
                
                # Выполняем код пользователя
                exec(user_code, namespace)
                
                # Получаем результат из переменной 'result'
                if 'result' not in namespace:
                    test_error = "Переменная 'result' не найдена. Сохраните ответ в переменную result."
                else:
                    actual_result = namespace['result']
                    passed = actual_result == expected
                    
            except Exception as e:
                test_error = str(e)
                actual_result = None

            results.append({
                "test_num": i + 1,
                "variables": variables,
                "expected": expected,
                "actual": actual_result,
                "passed": passed,
                "error": test_error,
            })

        print(json.dumps(results))

    except Exception as e:
        print(json.dumps([{"passed": False, "error": f"Fatal error: {str(e)}"}]))
        sys.exit(1)


if __name__ == "__main__":
    main()