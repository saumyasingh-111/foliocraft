export type ThemeId =
  | "minimal-editorial"
  | "creative-experimental"
  | "modern-developer"
  | "elegant-luxury"
  | "playful-colorful"
  | "corporate-professional";

export type SectionType =
  | "hero"
  | "about"
  | "education"
  | "experience"
  | "skills"
  | "projects"
  | "achievements"
  | "certifications"
  | "testimonials"
  | "services"
  | "gallery"
  | "contact"
  | "socialLinks";

export interface SectionConfig {
  id: string;
  type: SectionType;
  title: string;
  isVisible: boolean;
  order: number;
}

export interface ThemePalette {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  accent: string;
  border: string;
}

export interface ThemeTypography {
  headingFont: "Playfair Display" | "DM Serif Display" | "Cormorant Garamond" | "Space Grotesk";
  bodyFont: "DM Sans" | "Inter" | "Manrope" | "Plus Jakarta Sans";
  headingWeight: "normal" | "medium" | "semibold" | "bold";
  baseFontSize: "sm" | "md" | "lg";
}

export interface ThemeAppearance {
  borderRadius: "none" | "sm" | "md" | "lg" | "full";
  cardStyle: "flat" | "bordered" | "elevated" | "glass";
  buttonStyle: "sharp" | "rounded" | "pill";
  imageShape: "natural" | "rounded" | "circle" | "arch";
  layoutWidth: "contained" | "wide" | "editorial";
  sectionSpacing: "compact" | "comfortable" | "spacious";
}

export interface ThemeAnimation {
  transitionStyle: "fade" | "slide" | "minimal" | "playful";
  enableScrollAnimation: boolean;
}

export interface ThemeSettings {
  palette: ThemePalette;
  typography: ThemeTypography;
  appearance: ThemeAppearance;
  animation: ThemeAnimation;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  grade?: string;
  description?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  employmentType: "Full-time" | "Part-time" | "Contract" | "Freelance" | "Internship";
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  skillsUsed: string[];
}

export interface SkillItem {
  id: string;
  name: string;
  category: "Technical" | "Languages" | "Frameworks" | "Tools" | "Soft Skills" | "Design";
  proficiency?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  category: string;
  role?: string;
  coverImageUrl?: string;
  galleryImages?: string[];
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;
  featured: boolean;
}

export interface AchievementItem {
  id: string;
  title: string;
  organization: string;
  date: string;
  description?: string;
  certificateUrl?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface TestimonialItem {
  id: string;
  author: string;
  role: string;
  company: string;
  avatarUrl?: string;
  quote: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  rate?: string;
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  twitter?: string;
  instagram?: string;
  behance?: string;
  dribbble?: string;
  personalWebsite?: string;
  youtube?: string;
  email?: string;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  content: string;
}

// ===============================================================
// DYNAMIC SECTION SYSTEM TYPES
// ===============================================================
export type DynamicFieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "url"
  | "email"
  | "boolean"
  | "select"
  | "multi-select"
  | "image"
  | "image-gallery"
  | "document"
  | "tags"
  | "location";

export interface DynamicSectionField {
  id: string;
  label: string;
  type: DynamicFieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[]; // for select / multi-select
  description?: string;
}

export type DynamicSectionLayout =
  | "cards"
  | "editorial-cards"
  | "timeline"
  | "achievement-grid"
  | "gallery"
  | "masonry"
  | "list"
  | "stats"
  | "featured"
  | "split"
  | "minimal";

export interface DynamicSectionEntry {
  id: string;
  [fieldId: string]: any;
}

export interface DynamicSection {
  id: string;
  type?: "custom" | string;
  title: string;
  subtitle?: string;
  description?: string;
  category?: string;
  icon?: string;
  isVisible: boolean;
  order: number;
  layout: DynamicSectionLayout;
  fields: DynamicSectionField[];
  entries: DynamicSectionEntry[];
  themeSettings?: Record<string, any>;
}

export interface PortfolioData {
  portfolioId: string;
  userId: string;
  ownerId?: string; // Canonical owner UID
  username: string; // URL slug e.g. "alex-morgan"
  slug?: string; // Canonical alias for username slug
  title: string;
  professionalTitle?: string;
  description?: string;
  profileImage?: string | null;
  selectedTheme?: ThemeId;
  customThemeSettings?: ThemeSettings;
  isPublished: boolean;
  published?: boolean; // Canonical alias for isPublished
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  resumeURL?: string | null; // Canonical alias for resumeUrl

  themeId: ThemeId;
  themeSettings: ThemeSettings;
  sections: SectionConfig[];

  personalInfo: {
    fullName: string;
    professionalTitle: string;
    avatarUrl?: string;
    location?: string;
    email?: string;
    phone?: string;
    tagline?: string;
    heroHeadline?: string;
    heroSubheadline?: string;
    statusBadge?: string;
  };

  about: {
    bioLong?: string;
    careerInterests?: string[];
    areasOfExpertise?: string[];
    yearsOfExperience?: number;
  };

  education: EducationItem[];
  experience: ExperienceItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  achievements: AchievementItem[];
  certifications: CertificationItem[];
  testimonials?: TestimonialItem[];
  services?: ServiceItem[];
  socialLinks: SocialLinks;
  resumeUrl?: string | null;
  customSections?: CustomSectionItem[];
  dynamicSections?: DynamicSection[];
}

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  tagline: string;
  description: string;
  category: "Editorial" | "Brutalist" | "Technical" | "Luxury" | "Playful" | "Corporate";
  previewGradient: string;
  bestFor: string;
  defaultSettings: ThemeSettings;
}
