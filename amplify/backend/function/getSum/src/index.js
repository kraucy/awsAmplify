exports.handler = async (event) => {
	if (event) {
		const response = event.arguments.number1 + event.arguments.number2;
		return response;
	}
	throw new Error('Resolver not found');
};
