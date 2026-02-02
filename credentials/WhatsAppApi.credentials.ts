import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class WhatsAppApi implements ICredentialType {
	name = 'whatsAppApi';

	displayName = 'WhatsApp API';

	documentationUrl =
		'https://developers.facebook.com/docs/whatsapp/cloud-api/get-started';

	properties: INodeProperties[] = [
		{
			displayName: 'Phone Number ID',
			name: 'phoneNumberId',
			type: 'string',
			default: '',
			description: 'Your WhatsApp Phone Number ID from Meta Business Manager',
			required: true,
		},
		{
			displayName: 'Business Account ID',
			name: 'businessAccountId',
			type: 'string',
			default: '',
			description: 'Your WhatsApp Business Account ID from Meta',
			required: true,
		},
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'Your Meta Access Token with WhatsApp permissions (get from https://business.facebook.com)',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials?.accessToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://graph.facebook.com',
			url: '=/v22.0/{{$credentials?.phoneNumberId}}?fields=display_phone_number',
			method: 'GET',
		},
	};
}
