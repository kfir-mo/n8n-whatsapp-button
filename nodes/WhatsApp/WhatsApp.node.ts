import {
	IExecuteFunctions,
	INodeExecutionData,
	NodeConnectionTypes,
	type IHttpRequestOptions,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';

interface ButtonConfig {
	buttonId: string;
	buttonTitle: string;
}

interface ButtonCollection {
	values?: ButtonConfig[];
}

export class WhatsApp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'WhatsApp',
		name: 'whatsApp',
		icon: 'file:whatsapp.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["useButtons"] ? "With Buttons" : "Text Message"}}',
		description: 'Send WhatsApp messages with buttons',
		defaults: {
			name: 'WhatsApp',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'whatsAppApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://graph.facebook.com',
			headers: {
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Phone Number',
				name: 'phoneNumber',
				type: 'string',
				default: '',
				placeholder: '{{ $json.phone }}',
				description:
					'Recipient phone number with country code (e.g., +1234567890). Can use expressions like {{ $json.phone }}',
				required: true,
			},
			{
				displayName: 'Message Text',
				name: 'messageText',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				placeholder: 'What would you like to update?',
				description: 'The message text to send. Supports emoji and multi-line text.',
				required: true,
			},
			{
				displayName: 'Interactive Buttons',
				name: 'useButtons',
				type: 'boolean',
				default: false,
				description: 'Whether to add interactive reply buttons to this message',
			},
			{
				displayName: 'Add More Buttons',
				name: 'buttons',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {
					values: [
						{
							buttonId: 'btn_1',
							buttonTitle: 'Option 1',
						},
					],
				},
				options: [
					{
						displayName: 'Button',
						name: 'values',
						values: [
							{
								displayName: 'Button ID',
								name: 'buttonId',
								type: 'string',
								default: '',
								placeholder: 'btn_find_attractions',
								description: 'Unique identifier for this button that will be returned when pressed',
								required: true,
							},
							{
								displayName: 'Button Title',
								name: 'buttonTitle',
								type: 'string',
								default: '',
								placeholder: 'Find Attractions 🎡',
								description: 'Display text for the button (max 20 characters)',
								required: true,
							},
						],
					},
				],
				displayOptions: {
					show: {
						useButtons: [true],
					},
				},
			},
			{
				displayName: 'Advanced Options',
				name: 'advancedOptions',
				type: 'collection',
				placeholder: 'Add Options',
				default: {},
				options: [
					{
						displayName: 'Custom HTTP Headers',
						name: 'customHeaders',
						type: 'json',
						default: '{}',
						description: 'Add custom HTTP headers as JSON (optional)',
						typeOptions: {
							rows: 4,
						},
					},
					{
						displayName: 'Request Timeout (ms)',
						name: 'timeout',
						type: 'number',
						default: 30000,
						description: 'Timeout for the HTTP request in milliseconds',
					},
					{
						displayName: 'Retry on Failure',
						name: 'retryOnFail',
						type: 'boolean',
						default: false,
						description: 'Automatically retry if the request fails',
					},
					{
						displayName: 'Max Retries',
						name: 'maxRetries',
						type: 'number',
						default: 3,
						description: 'Maximum number of retries',
						displayOptions: {
							show: {
								retryOnFail: [true],
							},
						},
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const results: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const phoneNumber = this.getNodeParameter('phoneNumber', i) as string;
				const messageText = this.getNodeParameter('messageText', i) as string;
				const useButtons = this.getNodeParameter('useButtons', i) as boolean;
				const advancedOptions = this.getNodeParameter('advancedOptions', i) as Record<string, any>;

				const credentials = await this.getCredentials('whatsAppApi');
				const phoneNumberId = credentials.phoneNumberId as string;

				let body: Record<string, any>;

				// Handle message with buttons
				if (useButtons) {
					const buttonsConfig = this.getNodeParameter('buttons', i) as ButtonCollection;
					const buttons = (buttonsConfig.values || [])
						.map((btn: ButtonConfig) => ({
							type: 'reply',
							reply: {
								id: btn.buttonId,
								title: btn.buttonTitle,
							},
						}));

					body = {
						messaging_product: 'whatsapp',
						recipient_type: 'individual',
						to: phoneNumber,
						type: 'interactive',
						interactive: {
							type: 'button',
							body: {
								text: messageText,
							},
							action: {
								buttons,
							},
						},
					};
				}
				// Simple text message
				else {
					body = {
						messaging_product: 'whatsapp',
						recipient_type: 'individual',
						to: phoneNumber,
						type: 'text',
						text: {
							body: messageText,
						},
					};
				}

				// Build request options
				const headers: Record<string, string> = {
					Authorization: `Bearer ${credentials.accessToken}`,
					'Content-Type': 'application/json',
				};

				// Add custom headers if provided
				if (advancedOptions?.customHeaders) {
					try {
						const customHeaders = JSON.parse(advancedOptions.customHeaders);
						Object.assign(headers, customHeaders);
					} catch (e) {
						// Ignore invalid JSON
					}
				}

				const options: IHttpRequestOptions = {
					method: 'POST',
					url: `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
					headers,
					body,
					json: true,
					timeout: advancedOptions?.timeout || 30000,
				};

				const response = await this.helpers.httpRequest(options);

				results.push({
					json: response,
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					results.push({
						json: {
							error: error instanceof Error ? error.message : 'Unknown error',
						},
						pairedItem: { item: i },
					});
				} else {
					throw error;
				}
			}
		}

		return [results];
	}
}
