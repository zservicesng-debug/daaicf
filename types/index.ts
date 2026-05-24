export type PostCategory =
  | "Health"
  | "Education"
  | "Empowerment"
  | "Events"
  | "Infrastructure";

export interface SocialLinks {
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
}

export type GalleryAlbum =
  | "Health Outreach"
  | "Education"
  | "Empowerment"
  | "Events"
  | "Relief";

export type GalleryMediaType = "image" | "video";

export type HelpType =
  | "Education"
  | "Medical"
  | "Food/Relief"
  | "Empowerment"
  | "Other";

export type ApplicationStatus = "new" | "reviewed" | "approved" | "rejected";

export type PortalRole = "admin" | "sponsor" | "partner";

export type SponsorPreference =
  | "General Support"
  | "Specific Sector(s)"
  | "Specific Project(s)";

export type SponsorSector =
  | "Health"
  | "Education"
  | "Empowerment"
  | "Events"
  | "Infrastructure"
  | "Relief";

export type PartnerInterest =
  | "Health Outreach"
  | "Education"
  | "Food Relief"
  | "Empowerment"
  | "Events"
  | "General";

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: PostCategory;
  socialLinks: SocialLinks;
  coverImageUrl: string;
  coverImagePath?: string | null;
  galleryImageUrls: string[];
  galleryImagePaths: string[];
  published: boolean;
  showOnHome: boolean;
  createdAt: string;
}

export interface GalleryImage {
  id: string;
  collectionId: string;
  collectionTitle: string;
  imageUrl: string;
  imagePath?: string | null;
  mediaType: GalleryMediaType;
  caption: string;
  album: GalleryAlbum;
  year: number;
  createdAt: string;
}

export interface GalleryCollection {
  id: string;
  title: string;
  album: GalleryAlbum;
  year: number;
  items: GalleryImage[];
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  message: string;
  status: "pending" | "approved";
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export interface HelpApplication {
  id: string;
  name: string;
  phone: string;
  location: string;
  helpType: HelpType;
  description: string;
  howHeard?: string;
  evidenceImageUrls: string[];
  evidenceImagePaths: string[];
  status: ApplicationStatus;
  createdAt: string;
}

export interface SponsorApplication {
  id: string;
  name: string;
  orgName: string;
  email: string;
  phone: string;
  applicantType: "Individual" | "Corporate";
  sponsorshipPreference: SponsorPreference;
  sectorInterests: SponsorSector[];
  projectIds: string[];
  budgetRange: string;
  message?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface PartnerApplication {
  id: string;
  orgName: string;
  contactName: string;
  email: string;
  phone: string;
  orgType: string;
  partnershipInterests: PartnerInterest[];
  description: string;
  website?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: SponsorSector;
  status: "active" | "completed";
  budgetGoal: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  role: PortalRole;
  displayName: string;
  orgName?: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  status: "active" | "inactive";
  createdAt: string;
}

export interface MockCredentialUser extends UserProfile {
  password: string;
}

export interface SponsorProjectAccess {
  id: string;
  sponsorUserId: string;
  projectId: string;
  grantedAt: string;
}

export interface PartnerPermission {
  id: string;
  partnerUserId: string;
  permissionKey: string;
  grantedAt: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: "sponsor" | "partner";
  createdBy: string;
  allowJoinRequests: boolean;
  linkedUserId: string;
  createdAt: string;
}

export interface ChatMember {
  id: string;
  roomId: string;
  userId: string;
  role: "owner" | "member";
  joinedAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  message: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  initials: string;
  name: string;
  role: string;
  description: string;
  imageUrl?: string | null;
  imagePath?: string | null;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface SettingsBundle {
  impact: {
    communitiesReached: number;
    beneficiariesSupported: number;
    eventsHeld: number;
    yearsOfService: number;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
    facebookUrl: string;
    twitterUrl: string;
    instagramUrl: string;
  };
  organization: {
    name: string;
    rcNumber: string;
    tagline: string;
    country: string;
  };
}

export interface PortalSession {
  userId: string;
  role: PortalRole;
  displayName: string;
  email: string;
  orgName?: string;
  isAdmin: boolean;
  status: "active" | "inactive";
}

export interface DashboardSnapshot {
  totalPosts: number;
  newApplications: number;
  pendingComments: number;
  galleryImages: number;
  activeSponsors: number;
  activePartners: number;
}

export interface SiteStore {
  settings: SettingsBundle;
  posts: Post[];
  gallery: GalleryImage[];
  comments: Comment[];
  contactMessages: ContactMessage[];
  applications: HelpApplication[];
  sponsorApplications: SponsorApplication[];
  partnerApplications: PartnerApplication[];
  projects: Project[];
  users: MockCredentialUser[];
  sponsorAccess: SponsorProjectAccess[];
  partnerPermissions: PartnerPermission[];
  chatRooms: ChatRoom[];
  chatMembers: ChatMember[];
  chatMessages: ChatMessage[];
  teamMembers: TeamMember[];
}
