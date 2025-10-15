import { Model, Document, Types } from 'mongoose';
import { VirtualId, MongooseTimestamps } from './mongoose';

/** Full Api Key interface */
export interface IApiKey extends VirtualId, MongooseTimestamps {
  label: string;
  lastUsedAt?: Date;
  hashedKey: string;
}

/** Mongoose document object for API Key */
export interface ApiKeyDocument
  extends IApiKey,
    Omit<Document<Types.ObjectId>, 'id'> {
  toJSON(options?: any): SanitisedApiKey;
  toObject(options?: any): SanitisedApiKey;
}

/**
 * Sanitised API key object which hides the `hashedKey` field
 * and can be exposed to the client
 */
export interface SanitisedApiKey
  extends Pick<ApiKeyDocument, 'id' | 'label' | 'lastUsedAt' | 'createdAt'> {}

/** Mongoose model for API Key */
export interface ApiKeyModel extends Model<ApiKeyDocument> {}
