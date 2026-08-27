/**
 * SwasthAI WhatsApp Outreach System — Official Meta Cloud API Client
 * ====================================================================
 * Secure integration with Meta WhatsApp Business Platform / Cloud API.
 * Never uses browser automation, Puppeteer, or scraping.
 */

import { WhatsAppConfig } from "./types";
import { normalizePhoneNumber } from "./validator";

export interface SendTemplateParams {
  toPhone: string;
  templateName: string;
  languageCode?: string;
  bodyVariables?: string[];
}

export interface SendTextParams {
  toPhone: string;
  text: string;
}

export interface MetaApiResponse {
  success: boolean;
  messageId?: string;
  contacts?: Array<{ input: string; wa_id: string }>;
  messages?: Array<{ id: string }>;
  error?: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
  httpStatus?: number;
  rawResponse?: any;
}

export class MetaWhatsAppClient {
  private config: WhatsAppConfig;

  constructor(config?: Partial<WhatsAppConfig>) {
    this.config = {
      accessToken: config?.accessToken || process.env.WHATSAPP_ACCESS_TOKEN,
      phoneNumberId: config?.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID,
      businessAccountId: config?.businessAccountId || process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
      apiVersion: config?.apiVersion || process.env.WHATSAPP_API_VERSION || "v20.0",
      webhookVerifyToken: config?.webhookVerifyToken || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
      testNumber: config?.testNumber || process.env.WHATSAPP_TEST_NUMBER,
      dailyLimit: Number(config?.dailyLimit || process.env.WHATSAPP_DAILY_LIMIT || 10),
      founderName: "Sankalp Mishra",
      founderPhone: "+91 9140721395",
      founderEmail: "swasthai.founder@gmail.com",
      websiteUrl: "https://swasthai-three.vercel.app/",
      demoAppUrl: "https://swasthai-2tv5.onrender.com/"
    };
  }

  public getConfig(): WhatsAppConfig {
    return { ...this.config };
  }

  public isConfigured(): boolean {
    return Boolean(this.config.accessToken && this.config.phoneNumberId);
  }

  /**
   * Sends an approved WhatsApp Template message (Standard for initiating cold outreach)
   */
  public async sendTemplate(params: SendTemplateParams): Promise<MetaApiResponse> {
    const norm = normalizePhoneNumber(params.toPhone);
    if (!norm.isValid) {
      return {
        success: false,
        error: {
          message: `Invalid recipient phone number: ${norm.error}`,
          type: "ValidationException",
          code: 400
        }
      };
    }

    if (!this.isConfigured()) {
      return {
        success: false,
        error: {
          message: "Meta WhatsApp API credentials missing. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID.",
          type: "ConfigurationException",
          code: 401
        }
      };
    }

    // Format Meta recipient: phone without leading '+'
    const recipient = norm.normalizedPhone.replace(/^\+/, "");

    // Build components if body parameters are provided
    const components: any[] = [];
    if (params.bodyVariables && params.bodyVariables.length > 0) {
      components.push({
        type: "body",
        parameters: params.bodyVariables.map(val => ({
          type: "text",
          text: val
        }))
      });
    }

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipient,
      type: "template",
      template: {
        name: params.templateName,
        language: {
          code: params.languageCode || "en"
        },
        components: components.length > 0 ? components : undefined
      }
    };

    return this.postToGraphApi(payload);
  }

  /**
   * Sends a free-form text message (Used within 24-hour active conversation window or for tests)
   */
  public async sendTextMessage(params: SendTextParams): Promise<MetaApiResponse> {
    const norm = normalizePhoneNumber(params.toPhone);
    if (!norm.isValid) {
      return {
        success: false,
        error: {
          message: `Invalid recipient phone number: ${norm.error}`,
          type: "ValidationException",
          code: 400
        }
      };
    }

    if (!this.isConfigured()) {
      return {
        success: false,
        error: {
          message: "Meta WhatsApp API credentials missing. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID.",
          type: "ConfigurationException",
          code: 401
        }
      };
    }

    const recipient = norm.normalizedPhone.replace(/^\+/, "");

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipient,
      type: "text",
      text: {
        preview_url: true,
        body: params.text
      }
    };

    return this.postToGraphApi(payload);
  }

  private async postToGraphApi(payload: any): Promise<MetaApiResponse> {
    const url = `https://graph.facebook.com/${this.config.apiVersion}/${this.config.phoneNumberId}/messages`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        return {
          success: false,
          httpStatus: response.status,
          error: data.error || {
            message: `HTTP ${response.status}: Failed to deliver message`,
            type: "MetaGraphApiError",
            code: response.status
          },
          rawResponse: data
        };
      }

      const messageId = data.messages?.[0]?.id;
      return {
        success: true,
        httpStatus: response.status,
        messageId,
        contacts: data.contacts,
        messages: data.messages,
        rawResponse: data
      };
    } catch (err: any) {
      return {
        success: false,
        error: {
          message: err?.message || "Network error while connecting to Meta WhatsApp Cloud API",
          type: "NetworkException",
          code: 500
        }
      };
    }
  }

  /**
   * Verifies Meta Webhook challenge token
   */
  public verifyWebhook(mode: string | null, token: string | null, challenge: string | null): string | null {
    if (mode === "subscribe" && token === this.config.webhookVerifyToken) {
      return challenge;
    }
    return null;
  }
}
