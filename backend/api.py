from flask import Flask
from flask_restx import Api, Resource, fields
from flask_cors import CORS
from llm_model import FinancialAdvisor

app = Flask(__name__)
CORS(app)

api = Api(app, version='1.0', title='Financial Advice API',
          description='An API for getting financial advice on stocks and portfolios')

ns = api.namespace('finance', description='Financial advice operations')

financial_advisor = FinancialAdvisor()

query_model = api.model('Query', {
    'question': fields.String(required=True, description='The financial query or request for advice')
})

@ns.route('/advice')
class FinancialAdvice(Resource):
    @api.expect(query_model)
    @api.doc(responses={200: 'Success', 400: 'Validation Error'})
    def post(self):
        """Get financial advice based on the given query"""
        question = api.payload['question']
        advice = financial_advisor.get_financial_advice(question)
        return {'advice': advice}, 200