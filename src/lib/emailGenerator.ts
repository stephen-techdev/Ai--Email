export type EmailType =
  | 'General'
  | 'Job Application'
  | 'Leave Request'
  | 'Meeting Request'
  | 'Thank You';

export type Tone = 'Professional' | 'Friendly' | 'Formal' | 'Casual';

export type EmailLength = 'Short' | 'Medium' | 'Long';

export interface EmailParams {
  name: string;
  purpose: string;
  emailType: EmailType;
  tone: Tone;
  length: EmailLength;
}

const greetings: Record<Tone, (name: string) => string> = {
  Professional: (name) => `Dear ${name},`,
  Friendly: (name) => `Hi ${name},`,
  Formal: (name) => `Respected ${name},`,
  Casual: (name) => `Hello ${name},`,
};

const closings: Record<Tone, string> = {
  Professional: 'Best regards,',
  Friendly: 'Thanks and regards,',
  Formal: 'Yours sincerely,',
  Casual: 'Thanks,',
};

function buildBody(emailType: EmailType, purpose: string): string {
  switch (emailType) {
    case 'Job Application':
      return `I am writing to express my interest regarding ${purpose}. I am very interested in this opportunity and believe that my skills and knowledge would allow me to contribute effectively.\n\nI would appreciate the opportunity to discuss this position and learn more about the requirements.`;
    case 'Leave Request':
      return `I am writing to request leave regarding ${purpose}. I kindly request you to consider my request and grant me permission for the required period.\n\nI will make sure that any pending responsibilities are completed appropriately.`;
    case 'Meeting Request':
      return `I would like to request a meeting regarding ${purpose}. Please let me know a convenient time for us to discuss this matter in detail.\n\nI look forward to your response.`;
    case 'Thank You':
      return `I would like to sincerely thank you regarding ${purpose}. I really appreciate your time, support, and consideration.\n\nYour help is greatly appreciated.`;
    default:
      return `I am writing regarding ${purpose}.\n\nI would appreciate your time and consideration regarding this matter. Please let me know if you require any additional information from my side.`;
  }
}

function adjustLength(body: string, length: EmailLength): string {
  if (length === 'Short') {
    return body.length > 350 ? body.slice(0, 350).trim() : body;
  }
  if (length === 'Long') {
    return `${body}\n\nPlease feel free to contact me if you need any additional information or clarification. I would be happy to provide the necessary details.\n\nThank you for your time and consideration.`;
  }
  return body;
}

export function generateEmail(params: EmailParams): string {
  const { name, purpose, emailType, tone, length } = params;
  const recipient = name.trim() || 'Sir/Madam';
  const greeting = greetings[tone](recipient);
  let body = buildBody(emailType, purpose.trim());
  body = adjustLength(body, length);
  const closing = closings[tone];

  return `${greeting}\n\n${body.trim()}\n\n${closing}\nYour Name`;
}
