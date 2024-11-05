import { defineCodeRunnersSetup } from "@slidev/types";

export default defineCodeRunnersSetup(() => {
  return {
    async rust(code, ctx) {
      const response = await fetch("https://wandbox.org/api/compile.json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          compiler: "rust-1.69.0",
          code,
          options: "",
          "compiler-option-raw": "",
          "runtime-option-raw": "",
        }),
      });

      const result = await response.json();
      if (result.status !== "0") {
        return {
          error: result.compiler_message,
        };
      }
      return {
        text: result.program_message,
      };
    },
    async python(code, ctx) {
      const response = await fetch("https://wandbox.org/api/compile.json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          compiler: "cpython-3.12.1",
          code,
          options: "",
          "compiler-option-raw": "",
          "runtime-option-raw": "",
        }),
      });

      const result = await response.json();
      if (result.status !== "0") {
        return {
          error: result.compiler_message,
        };
      }
      return {
        text: result.program_message,
      };
    },
  };
});
