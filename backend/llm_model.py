from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel
import torch

class FinancialAdvisor:
    def __init__(self):
        from huggingface_hub import login
        login(token="") # Add huggingface token here

        base_model = "meta-llama/Meta-Llama-3-8B"
        peft_model = "FinGPT/fingpt-mt_llama3-8b_lora"

        self.tokenizer = AutoTokenizer.from_pretrained(base_model, trust_remote_code=True)
        self.tokenizer.pad_token = self.tokenizer.eos_token

        model = AutoModelForCausalLM.from_pretrained(base_model, trust_remote_code=True, torch_dtype=torch.float32)
        self.model = PeftModel.from_pretrained(model, peft_model)
        self.model = self.model.eval()

        self.device = torch.device("cuda")
        self.model = self.model.to(self.device)

    def get_financial_advice(self, query):
        prompt = f"As a financial advisor, please provide detailed advice on the following query: {query}\n\nAdvice:"

        inputs = self.tokenizer(prompt, return_tensors="pt", padding=True, truncation=True, max_length=512).to(self.device)

        with torch.no_grad():
            outputs = self.model.generate(**inputs, max_new_tokens=200, num_return_sequences=1)

        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        advice = response.split("Advice:")[1].strip()

        return advice