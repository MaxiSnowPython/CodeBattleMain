import json
import sys
import signal
import inspect
from pathlib import Path

EXEC_TIMEOUT = 3  # секунды на весь exec() пользователя
TEST_TIMEOUT = 2  # секунды на один тест

class TimeoutError(Exception):
    pass

def _timeout_handler(signum, frame):
    raise TimeoutError("Time limit exceeded")

def main():
    try:
        code_file = Path("/sandbox/code.py")
        tests_file = Path("/sandbox/tests.json")

        if not code_file.exists() or not tests_file.exists():
            print(json.dumps([{"passed": False, "error": "Internal error: files not found"}]))
            sys.exit(1)

        user_code = code_file.read_text(encoding="utf-8")
        tests = json.loads(tests_file.read_text(encoding="utf-8"))

        namespace = {}
        try:
            signal.signal(signal.SIGALRM, _timeout_handler)
            signal.alarm(EXEC_TIMEOUT)
            exec(user_code, namespace)
            signal.alarm(0)
        except TimeoutError:
            print(json.dumps([{"passed": False, "error": "Time limit exceeded"}]))
            return
        except Exception as e:
            signal.alarm(0)
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
                signal.signal(signal.SIGALRM, _timeout_handler)
                signal.alarm(TEST_TIMEOUT)
                actual = user_func(**variables)
                signal.alarm(0)
                results.append({
                    "test_num": i + 1,
                    "passed": actual == expected,
                    "input": variables,
                    "output": actual,
                    "expected": expected,
                })
            except TimeoutError:
                results.append({
                    "test_num": i + 1,
                    "passed": False,
                    "error": "Time limit exceeded"
                })
            except Exception as e:
                signal.alarm(0)
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