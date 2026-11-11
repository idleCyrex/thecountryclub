import mongoose, { Schema, type Model } from 'mongoose'

function model<T>(name: string, schema: Schema<T>, collection: string): Model<T> {
  return (mongoose.models[name] as Model<T>) || mongoose.model<T>(name, schema, collection)
}

const opts = { timestamps: true } as const

export interface MediaDoc { key: string; publicId: string; kind: 'image' | 'video'; width?: number; height?: number; alt: string; file?: string; poster?: string | null }
export const MediaModel = model<MediaDoc>('Media', new Schema<MediaDoc>({
  key: { type: String, required: true, unique: true },
  publicId: { type: String, required: true },
  kind: { type: String, enum: ['image', 'video'], required: true },
  width: Number,
  height: Number,
  alt: { type: String, default: '' },
  file: String,
  poster: String,
}, opts), 'media')

export const ClassItemModel = model('ClassItem', new Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  tag: String,
  icon: String,
  media: String,
  blurb: String,
  details: [String],
  order: { type: Number, default: 0 },
}, opts), 'classitems')

export const FacilityModel = model('Facility', new Schema({
  slug: { type: String, required: true, unique: true },
  group: { type: String, enum: ['home', 'amenity'], default: 'amenity' },
  title: { type: String, required: true },
  line: String,
  href: String,
  order: { type: Number, default: 0 },
}, opts), 'facilities')

export const TeamMemberModel = model('TeamMember', new Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: String,
  summary: String,
  bio: [String],
  phone: String,
  order: { type: Number, default: 0 },
}, opts), 'teammembers')

export const SpaTreatmentModel = model('SpaTreatment', new Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: String,
  description: String,
  options: [String],
  order: { type: Number, default: 0 },
}, opts), 'spatreatments')

export const SettingsModel = model('Settings', new Schema({
  key: { type: String, required: true, unique: true },
  data: Schema.Types.Mixed,
  copy: Schema.Types.Mixed,
}, opts), 'settings')

export interface InquiryDoc { name: string; email: string; phone?: string; interest: string; message: string; ip?: string; userAgent?: string; status: 'new' | 'handled' }
export const InquiryModel = model<InquiryDoc>('Inquiry', new Schema<InquiryDoc>({
  name: { type: String, required: true, maxlength: 120 },
  email: { type: String, required: true, maxlength: 200 },
  phone: { type: String, maxlength: 40 },
  interest: { type: String, enum: ['membership', 'tennis', 'spa', 'personal-training', 'other'], required: true },
  message: { type: String, required: true, maxlength: 4000 },
  ip: String,
  userAgent: String,
  status: { type: String, enum: ['new', 'handled'], default: 'new' },
}, opts), 'inquiries')
