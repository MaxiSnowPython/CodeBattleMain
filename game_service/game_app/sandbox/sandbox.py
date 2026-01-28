import json
import subprocess
import tempfile
from pathlib import Path

DOCKER_IMAGE = "game-service-image"

def run_in_sandbox(user_code: str, tests: list) -> dict:
    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)

        (tmp_path / "code.py").write_text(user_code, encoding="utf-8")
        (tmp_path / "tests.json").write_text(json.dumps(tests), encoding="utf-8")

        print(f"🔍 Temp directory: {tmp_path}")
        print(f"📁 Files created:")
        print(f"   - code.py exists: {(tmp_path / 'code.py').exists()}")
        print(f"   - tests.json exists: {(tmp_path / 'tests.json').exists()}")

        try:
            result = subprocess.run(
                [
                    "docker", "run", "--rm",
                    "-v", f"{tmp_path}:/sandbox",
                    DOCKER_IMAGE
                ],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            print(f"🐳 Docker exit code: {result.returncode}")
            print(f"📤 STDOUT: {result.stdout}")
            print(f"📤 STDERR: {result.stderr}")
            
        except subprocess.TimeoutExpired:
            print("⏱️ Timeout!")
            return {"error": "Timeout"}

        if result.returncode != 0:
            return {"error": result.stderr}

        try:
            output = json.loads(result.stdout)
            return {"output": output}
        except json.JSONDecodeError as e:
            return {"error": f"JSON decode error: {e}\nOutput: {result.stdout}"}