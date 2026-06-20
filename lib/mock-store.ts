import {
  type ApplicationStatus,
  type ChatRoom,
  type Comment,
  type GalleryCollection,
  type GalleryMediaType,
  type HelpApplication,
  type MockCredentialUser,
  type PartnerApplication,
  type PortalRole,
  type Post,
  type Project,
  type SiteStore,
  type SponsorApplication,
} from "@/types";
import { getConfiguredSocialLinks } from "@/lib/site-config";
import {
  createPlaceholderImage,
  excerpt,
  guessGalleryMediaTypeFromUrl,
  initialsFromName,
  slugify,
} from "@/lib/utils";

const founderVisionImage = createPlaceholderImage({
  title: "Supporting the Backbones",
  subtitle: "Community relief - compassion - partnership",
  accent: "#C41E1E",
});

const founderPortraitImage = createPlaceholderImage({
  title: "Dr. Andrew A. Igwe",
  subtitle: "Environmentalist - Philanthropist - Visionary",
  accent: "#1A5C2A",
  background: "#48667D",
});

function isoDate(daysAgo: number) {
  const now = new Date("2025-03-20T09:00:00.000Z");
  now.setDate(now.getDate() - daysAgo);
  return now.toISOString();
}

function buildDefaultGalleryYears() {
  return Array.from({ length: 10 }, (_, index) => 2026 - index);
}

function sortTeamMembers(
  members: SiteStore["teamMembers"]
): SiteStore["teamMembers"] {
  return [...members].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.createdAt.localeCompare(right.createdAt);
  });
}

function mapGalleryCollections(items: SiteStore["gallery"]): GalleryCollection[] {
  const grouped = new Map<string, GalleryCollection>();

  for (const item of items) {
    const existing = grouped.get(item.collectionId);

    if (existing) {
      existing.items.push(item);
      if (item.createdAt < existing.createdAt) {
        existing.createdAt = item.createdAt;
      }
      continue;
    }

    grouped.set(item.collectionId, {
      id: item.collectionId,
      title: item.collectionTitle,
      album: item.album,
      year: item.year,
      items: [item],
      createdAt: item.createdAt,
    });
  }

  return Array.from(grouped.values())
    .map((collection) => ({
      ...collection,
      items: [...collection.items].sort((left, right) =>
        left.createdAt.localeCompare(right.createdAt)
      ),
    }))
    .sort((left, right) => {
      const leftLatest = left.items[left.items.length - 1]?.createdAt || left.createdAt;
      const rightLatest =
        right.items[right.items.length - 1]?.createdAt || right.createdAt;

      return rightLatest.localeCompare(leftLatest);
    });
}

function buildInitialStore(): SiteStore {
  const socialLinks = getConfiguredSocialLinks();

  /*
  const seededPosts: Post[] = [
    {
      id: "post-1",
      title: "Free Medical Outreach in Owerri Community",
      slug: "free-medical-outreach-in-owerri-community",
      excerpt:
        "Hundreds of residents received free medical consultations, screenings, and medications during our latest health outreach program.",
      content: createPostHtml(
        "Free Medical Outreach in Owerri Community",
        "Healthcare access"
      ),
      category: "Health",
      coverImageUrl: createPlaceholderImage({
        title: "Free Medical Outreach",
        subtitle: "Consultations - screenings - medications",
        accent: "#C41E1E",
      }),
      published: true,
      createdAt: isoDate(5),
    },
    {
      id: "post-2",
      title: "Scholarship Awards for Indigent Students",
      slug: "scholarship-awards-for-indigent-students",
      excerpt:
        "15 deserving students received full scholarships to continue their secondary and tertiary education through the DAAICF support scheme.",
      content: createPostHtml(
        "Scholarship Awards for Indigent Students",
        "Education opportunity"
      ),
      category: "Education",
      coverImageUrl: createPlaceholderImage({
        title: "Scholarship Awards",
        subtitle: "Opportunity - learning - future",
        accent: "#1A5C2A",
        background: "#7B9885",
      }),
      published: true,
      createdAt: isoDate(21),
    },
    {
      id: "post-3",
      title: "Women Empowerment & Skills Training Workshop",
      slug: "women-empowerment-skills-training-workshop",
      excerpt:
        "Over 80 women participated in a 3-day vocational training and economic empowerment workshop, acquiring skills in tailoring and food processing.",
      content: createPostHtml(
        "Women Empowerment & Skills Training Workshop",
        "Economic empowerment"
      ),
      category: "Empowerment",
      coverImageUrl: createPlaceholderImage({
        title: "Women Empowerment Workshop",
        subtitle: "Skills - enterprise - confidence",
        accent: "#A35C22",
        background: "#7A5A39",
      }),
      published: true,
      createdAt: isoDate(60),
    },
    {
      id: "post-4",
      title: "Annual Foundation Day Celebration & Awards",
      slug: "annual-foundation-day-celebration-awards",
      excerpt:
        "Stakeholders, volunteers, and beneficiaries gathered to celebrate impact milestones and honour outstanding community champions.",
      content: createPostHtml(
        "Annual Foundation Day Celebration & Awards",
        "Community celebration"
      ),
      category: "Events",
      coverImageUrl: createPlaceholderImage({
        title: "Foundation Day Celebration",
        subtitle: "Milestones - gratitude - recognition",
        accent: "#1E4F8E",
        background: "#2B4B73",
      }),
      published: true,
      createdAt: isoDate(99),
    },
    {
      id: "post-5",
      title: "Rural School Renovation & Supply Drive",
      slug: "rural-school-renovation-supply-drive",
      excerpt:
        "Classroom repairs, new desks, and core learning materials were delivered to support pupils in a rural public school.",
      content: createPostHtml(
        "Rural School Renovation & Supply Drive",
        "School infrastructure"
      ),
      category: "Education",
      coverImageUrl: createPlaceholderImage({
        title: "School Renovation Project",
        subtitle: "Classrooms - supplies - learning spaces",
        accent: "#1A5C2A",
        background: "#496F54",
      }),
      published: true,
      createdAt: isoDate(135),
    },
    {
      id: "post-6",
      title: "Free Eye Screening & Glasses Distribution",
      slug: "free-eye-screening-glasses-distribution",
      excerpt:
        "Residents received vision checks and corrective glasses through a focused outreach targeting elderly and low-income households.",
      content: createPostHtml(
        "Free Eye Screening & Glasses Distribution",
        "Preventive healthcare"
      ),
      category: "Health",
      coverImageUrl: createPlaceholderImage({
        title: "Eye Screening Outreach",
        subtitle: "Screening - referrals - care",
        accent: "#C41E1E",
        background: "#5B526C",
      }),
      published: true,
      createdAt: isoDate(153),
    },
  ];
  */

  const posts: Post[] = [];

  const projects: Project[] = [
    {
      id: "project-1",
      title: "Rural Health Access Initiative",
      description:
        "Quarterly community health screenings, medication support, and referral pathways for vulnerable households.",
      category: "Health",
      status: "active",
      budgetGoal: 18000000,
      createdAt: isoDate(70),
    },
    {
      id: "project-2",
      title: "Bright Futures Scholarship Fund",
      description:
        "A scholarship pool for exceptional students from low-income families across secondary and tertiary institutions.",
      category: "Education",
      status: "active",
      budgetGoal: 12000000,
      createdAt: isoDate(95),
    },
    {
      id: "project-3",
      title: "Women Skills & Enterprise Lab",
      description:
        "Vocational training, seed kits, and post-programme business mentoring for women-led households.",
      category: "Empowerment",
      status: "active",
      budgetGoal: 9500000,
      createdAt: isoDate(110),
    },
    {
      id: "project-4",
      title: "Emergency Relief & Family Support",
      description:
        "Food packs, household essentials, and rapid support for families affected by displacement or sudden hardship.",
      category: "Relief",
      status: "active",
      budgetGoal: 15000000,
      createdAt: isoDate(30),
    },
    {
      id: "project-5",
      title: "Community Awards & Volunteer Summit",
      description:
        "Annual convening to celebrate service and align future collaboration with volunteers, partners, and supporters.",
      category: "Events",
      status: "completed",
      budgetGoal: 4200000,
      createdAt: isoDate(200),
    },
  ];

  const users: MockCredentialUser[] = [
    {
      id: "user-admin",
      role: "admin",
      displayName: "DAAICF Administrator",
      email: "admin@daaicf.org",
      phone: "+234 000 000 0000",
      isAdmin: true,
      status: "active",
      password: "",
      createdAt: isoDate(365),
    },
    {
      id: "user-sponsor",
      role: "sponsor",
      displayName: "Hopewell Sponsors",
      orgName: "Hopewell Sponsors Ltd.",
      email: "sponsor@daaicf.org",
      phone: "+234 810 000 0001",
      isAdmin: false,
      status: "active",
      password: "",
      createdAt: isoDate(160),
    },
    {
      id: "user-partner",
      role: "partner",
      displayName: "CareBridge Initiative",
      orgName: "CareBridge Initiative",
      email: "partner@daaicf.org",
      phone: "+234 810 000 0002",
      isAdmin: false,
      status: "active",
      password: "",
      createdAt: isoDate(140),
    },
  ];

  return {
    settings: {
      impact: {
        communitiesReached: 40,
        beneficiariesSupported: 2000,
        eventsHeld: 85,
        yearsOfService: 17,
      },
      contact: {
        email: "info@daaicf.org",
        phone: "+234 000 000 0000",
        address: "Nigeria",
        facebookUrl: socialLinks.facebookUrl,
        twitterUrl: socialLinks.twitterUrl,
        instagramUrl: socialLinks.instagramUrl,
      },
      organization: {
        name: "Dr. Andrew A. Igwe Care Foundation",
        rcNumber: "170215",
        tagline: "Supporting the Backbones",
        country: "Nigeria",
      },
    },
    posts,
    gallery: [],
    comments: [],
    contactMessages: [],
    applications: [
      {
        id: "app-1",
        name: "Chukwuemeka Nwosu",
        phone: "+234 803 100 0001",
        location: "Owerri, Imo",
        helpType: "Medical",
        description: "Seeking support for surgery and follow-up medication.",
        evidenceImageUrls: [],
        evidenceImagePaths: [],
        status: "new",
        createdAt: isoDate(2),
      },
      {
        id: "app-2",
        name: "Aisha Bello",
        phone: "+234 803 100 0002",
        location: "Kano, Kano",
        helpType: "Education",
        description: "Needs support with school fees and books.",
        evidenceImageUrls: [],
        evidenceImagePaths: [],
        status: "reviewed",
        createdAt: isoDate(4),
      },
      {
        id: "app-3",
        name: "Taiwo Adeyemi",
        phone: "+234 803 100 0003",
        location: "Lagos, Lagos",
        helpType: "Food/Relief",
        description: "Temporary household relief for a displaced family.",
        evidenceImageUrls: [],
        evidenceImagePaths: [],
        status: "approved",
        createdAt: isoDate(6),
      },
      {
        id: "app-4",
        name: "Ngozi Okafor",
        phone: "+234 803 100 0004",
        location: "Enugu, Enugu",
        helpType: "Empowerment",
        description: "Requesting vocational training and starter support.",
        evidenceImageUrls: [],
        evidenceImagePaths: [],
        status: "new",
        createdAt: isoDate(8),
      },
      {
        id: "app-5",
        name: "Babatunde Olawale",
        phone: "+234 803 100 0005",
        location: "Ibadan, Oyo",
        helpType: "Medical",
        description: "Application previously declined due to incomplete records.",
        evidenceImageUrls: [],
        evidenceImagePaths: [],
        status: "rejected",
        createdAt: isoDate(10),
      },
    ],
    sponsorApplications: [
      {
        id: "sponsor-app-1",
        name: "Nneka Eze",
        orgName: "Hopewell Sponsors Ltd.",
        email: "nneka@hopewell.ng",
        phone: "+234 813 000 1000",
        applicantType: "Corporate",
        sponsorshipPreference: "Specific Project(s)",
        sectorInterests: ["Education", "Empowerment"],
        projectIds: ["project-1", "project-2"],
        budgetRange: "NGN 10m - NGN 25m",
        message:
          "We would like structured reporting and sponsor visibility on scholarship outcomes.",
        status: "pending",
        createdAt: isoDate(7),
      },
      {
        id: "sponsor-app-2",
        name: "David Omotosho",
        orgName: "Independent Supporter",
        email: "david@example.org",
        phone: "+234 813 000 1001",
        applicantType: "Individual",
        sponsorshipPreference: "General Support",
        sectorInterests: [],
        projectIds: [],
        budgetRange: "NGN 1m - NGN 5m",
        message: "Interested in recurring monthly support.",
        status: "approved",
        createdAt: isoDate(25),
      },
    ],
    partnerApplications: [
      {
        id: "partner-app-1",
        orgName: "CareBridge Initiative",
        contactName: "Favour Ndukwe",
        email: "favour@carebridge.org",
        phone: "+234 815 000 3300",
        orgType: "NGO",
        partnershipInterests: ["Health Outreach", "Events"],
        description:
          "We can provide volunteer clinicians and outreach logistics support.",
        website: "https://carebridge.org",
        status: "pending",
        createdAt: isoDate(9),
      },
      {
        id: "partner-app-2",
        orgName: "FuturePath Schools Network",
        contactName: "Mary Johnson",
        email: "mary@futurepath.edu",
        phone: "+234 815 000 3301",
        orgType: "Education",
        partnershipInterests: ["Education", "General"],
        description:
          "Seeking a formal collaboration on bursaries and school infrastructure.",
        website: "https://futurepath.edu",
        status: "approved",
        createdAt: isoDate(28),
      },
    ],
    projects,
    users,
    sponsorAccess: [
      {
        id: "access-1",
        sponsorUserId: "user-sponsor",
        projectId: "project-1",
        grantedAt: isoDate(40),
      },
      {
        id: "access-2",
        sponsorUserId: "user-sponsor",
        projectId: "project-2",
        grantedAt: isoDate(40),
      },
    ],
    partnerPermissions: [
      {
        id: "perm-1",
        partnerUserId: "user-partner",
        permissionKey: "public.posts",
        grantedAt: isoDate(35),
      },
      {
        id: "perm-2",
        partnerUserId: "user-partner",
        permissionKey: "reports.projects",
        grantedAt: isoDate(35),
      },
      {
        id: "perm-3",
        partnerUserId: "user-partner",
        permissionKey: "gallery.highlights",
        grantedAt: isoDate(35),
      },
    ],
    chatRooms: [
      {
        id: "room-1",
        name: "Hopewell Projects Room",
        type: "sponsor",
        createdBy: "user-admin",
        allowJoinRequests: false,
        linkedUserId: "user-sponsor",
        createdAt: isoDate(20),
      },
      {
        id: "room-2",
        name: "CareBridge Partnership Desk",
        type: "partner",
        createdBy: "user-admin",
        allowJoinRequests: true,
        linkedUserId: "user-partner",
        createdAt: isoDate(12),
      },
    ],
    chatMembers: [
      {
        id: "member-1",
        roomId: "room-1",
        userId: "user-admin",
        role: "owner",
        joinedAt: isoDate(20),
      },
      {
        id: "member-2",
        roomId: "room-1",
        userId: "user-sponsor",
        role: "member",
        joinedAt: isoDate(20),
      },
      {
        id: "member-3",
        roomId: "room-2",
        userId: "user-admin",
        role: "owner",
        joinedAt: isoDate(12),
      },
      {
        id: "member-4",
        roomId: "room-2",
        userId: "user-partner",
        role: "member",
        joinedAt: isoDate(12),
      },
    ],
    chatMessages: [
      {
        id: "message-1",
        roomId: "room-1",
        senderId: "user-admin",
        message:
          "Welcome to the sponsor room. We'll share monthly updates here.",
        createdAt: isoDate(19),
      },
      {
        id: "message-2",
        roomId: "room-1",
        senderId: "user-sponsor",
        message:
          "Thanks. Please send the latest scholarship disbursement overview.",
        createdAt: isoDate(18),
      },
      {
        id: "message-3",
        roomId: "room-2",
        senderId: "user-partner",
        message:
          "We can mobilize two volunteer clinicians for the next outreach.",
        createdAt: isoDate(10),
      },
    ],
    teamMembers: [],
  };
}

let store = buildInitialStore();
let galleryYears = buildDefaultGalleryYears();

export function resetMockStore() {
  store = buildInitialStore();
  galleryYears = buildDefaultGalleryYears();
}

export function getStore() {
  return structuredClone({
    ...store,
    teamMembers: sortTeamMembers(store.teamMembers),
  });
}

export function listPosts(options?: {
  category?: string;
  page?: number;
  perPage?: number;
  publishedOnly?: boolean;
  homeOnly?: boolean;
}) {
  const page = options?.page ?? 1;
  const perPage = options?.perPage ?? 6;

  let items = [...store.posts].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );

  if (options?.publishedOnly) {
    items = items.filter((post) => post.published);
  }

  if (options?.homeOnly) {
    items = items.filter((post) => post.showOnHome);
  }

  if (options?.category && options.category !== "All") {
    items = items.filter((post) => post.category === options.category);
  }

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;

  return {
    items: structuredClone(items.slice(start, start + perPage)),
    total,
    totalPages,
  };
}

export function getPostBySlug(slug: string) {
  const post = store.posts.find((item) => item.slug === slug);
  return post ? structuredClone(post) : null;
}

function syncMockPostGallery(post: Post) {
  store.gallery = store.gallery.filter((item) => item.sourcePostId !== post.id);

  if (!post.galleryYear) {
    return;
  }

  if (!galleryYears.includes(post.galleryYear)) {
    galleryYears = [...galleryYears, post.galleryYear].sort(
      (left, right) => right - left
    );
  }

  const imageUrls = Array.from(
    new Set([post.coverImageUrl, ...post.galleryImageUrls].filter(Boolean))
  );
  const createdAt = new Date().toISOString();

  store.gallery.unshift(
    ...imageUrls.map((imageUrl, index) => ({
      id: crypto.randomUUID(),
      collectionId: post.id,
      collectionTitle: post.title,
      imageUrl,
      imagePath: null,
      mediaType: "image" as const,
      caption: post.title,
      album: post.category,
      year: post.galleryYear!,
      sourcePostId: post.id,
      createdAt: new Date(Date.parse(createdAt) + index).toISOString(),
    }))
  );
}

export function createPost(input: {
  title: string;
  category: Post["category"];
  partnerName?: string | null;
  content: string;
  socialLinks: Post["socialLinks"];
  published: boolean;
  showOnHome: boolean;
  coverImageFile?: File | null;
  coverImageLink?: string;
  galleryImageFiles?: File[];
  galleryImageLinks?: string[];
  galleryUploadedImages?: Array<{ url: string; path: string }>;
  galleryYear?: number | null;
}) {
  const title = input.title.trim();
  const slug = slugify(title);
  const galleryImageUrls = [
    ...((input.galleryImageLinks || []).map((url) => url.trim()).filter(Boolean)),
    ...(input.galleryUploadedImages || []).map((item) => item.url),
    ...(input.galleryImageFiles || []).map((_, index) =>
      createPlaceholderImage({
        title: `${title} ${index + 1}`,
        subtitle: "More photos",
        accent: "#1A5C2A",
      })
    ),
  ];
  const post: Post = {
    id: crypto.randomUUID(),
    title,
    slug,
    excerpt: excerpt(input.content, 160),
    content: input.content,
    category: input.category,
    partnerName: input.partnerName?.trim() || null,
    socialLinks: input.socialLinks,
    coverImageUrl:
      input.coverImageLink?.trim() ||
      (input.coverImageFile
        ? createPlaceholderImage({
            title,
            subtitle: input.category,
            accent: input.category === "Health" ? "#C41E1E" : "#1A5C2A",
          })
        : createPlaceholderImage({
            title,
            subtitle: input.category,
            accent: input.category === "Health" ? "#C41E1E" : "#1A5C2A",
          })),
    galleryImageUrls,
    galleryImagePaths: (input.galleryUploadedImages || []).map((item) => item.path),
    galleryYear: input.galleryYear ?? null,
    published: input.published,
    showOnHome: input.showOnHome,
    createdAt: new Date().toISOString(),
  };

  store.posts.unshift(post);
  syncMockPostGallery(post);
  return structuredClone(post);
}

export function updatePost(
  slug: string,
  input: {
    title: string;
    category: Post["category"];
    partnerName?: string | null;
    content: string;
    socialLinks: Post["socialLinks"];
    published: boolean;
    showOnHome: boolean;
    coverImageFile?: File | null;
    coverImageLink?: string;
    galleryImageFiles?: File[];
    galleryImageLinks?: string[];
    galleryUploadedImages?: Array<{ url: string; path: string }>;
    clearGalleryImages?: boolean;
    galleryYear?: number | null;
  }
) {
  const index = store.posts.findIndex((item) => item.slug === slug);
  if (index === -1) {
    return null;
  }

  const nextSlug = slugify(input.title);
  const nextGalleryImageUrls = [
    ...((input.galleryImageLinks || []).map((url) => url.trim()).filter(Boolean)),
    ...(input.galleryUploadedImages || []).map((item) => item.url),
    ...(input.galleryImageFiles || []).map((_, imageIndex) =>
      createPlaceholderImage({
        title: `${input.title} ${imageIndex + 1}`,
        subtitle: "More photos",
        accent: "#1A5C2A",
      })
    ),
  ];
  const existingGalleryImageUrls = input.clearGalleryImages
    ? []
    : store.posts[index].galleryImageUrls;

  store.posts[index] = {
    ...store.posts[index],
    title: input.title,
    slug: nextSlug,
    category: input.category,
    partnerName: input.partnerName?.trim() || null,
    content: input.content,
    socialLinks: input.socialLinks,
    excerpt: excerpt(input.content, 160),
    published: input.published,
    showOnHome: input.showOnHome,
    coverImageUrl:
      input.coverImageLink?.trim() ||
      (input.coverImageFile
        ? createPlaceholderImage({
            title: input.title,
            subtitle: input.category,
            accent: input.category === "Health" ? "#C41E1E" : "#1A5C2A",
          })
        : store.posts[index].coverImageUrl ||
          createPlaceholderImage({
            title: input.title,
            subtitle: input.category,
          })),
    galleryImageUrls:
      nextGalleryImageUrls.length > 0
        ? [...existingGalleryImageUrls, ...nextGalleryImageUrls]
        : existingGalleryImageUrls,
    galleryImagePaths: [
      ...(input.clearGalleryImages ? [] : store.posts[index].galleryImagePaths),
      ...(input.galleryUploadedImages || []).map((item) => item.path),
    ],
    galleryYear: input.galleryYear ?? null,
  };

  syncMockPostGallery(store.posts[index]);
  return structuredClone(store.posts[index]);
}

export function deletePost(slug: string) {
  const target = store.posts.find((item) => item.slug === slug);
  if (!target) {
    return;
  }
  store.posts = store.posts.filter((item) => item.slug !== slug);
  store.comments = store.comments.filter((item) => item.postId !== target.id);
  store.gallery = store.gallery.filter((item) => item.sourcePostId !== target.id);
}

export function listGallery(options?: {
  album?: string;
  year?: number;
  collectionId?: string;
}) {
  let items = [...store.gallery];

  if (options?.album && options.album !== "All") {
    items = items.filter((item) => item.album === options.album);
  }

  if (options?.year) {
    items = items.filter((item) => item.year === options.year);
  }

  if (options?.collectionId) {
    items = items.filter((item) => item.collectionId === options.collectionId);
  }

  return structuredClone(
    [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  );
}

export function listGalleryCollections(options?: {
  album?: string;
  year?: number;
}) {
  return structuredClone(mapGalleryCollections(listGallery(options)));
}

export function listGalleryYears() {
  return structuredClone(galleryYears);
}

export function getGalleryCollectionById(collectionId: string) {
  const collections = mapGalleryCollections(
    store.gallery.filter((item) => item.collectionId === collectionId)
  );
  return collections[0] ? structuredClone(collections[0]) : null;
}

function resolveMockGalleryMedia(options: {
  title: string;
  mediaFiles?: File[];
  mediaLinks?: Array<{ url: string; type: GalleryMediaType; path?: string }>;
}) {
  const mediaFiles = options.mediaFiles || [];
  const mediaLinks = options.mediaLinks || [];

  const linkedMedia = mediaLinks.map((link, index) => ({
    id: crypto.randomUUID(),
    collectionId: "",
    collectionTitle: options.title,
    imageUrl: link.url.trim(),
    imagePath: link.path || null,
    mediaType: link.type || guessGalleryMediaTypeFromUrl(link.url),
    caption: `${options.title} ${index + 1}`,
    album: "Health" as SiteStore["gallery"][number]["album"],
    year: galleryYears[0] || new Date().getFullYear(),
    createdAt: new Date().toISOString(),
  }));

  const uploadedMedia = mediaFiles.map((file, index) => {
    const mediaType: GalleryMediaType = file.type.startsWith("video/")
      ? "video"
      : "image";

    return {
      id: crypto.randomUUID(),
      collectionId: "",
      collectionTitle: options.title,
      imageUrl: createPlaceholderImage({
        title: `${options.title} ${index + 1}`,
        subtitle: mediaType === "video" ? "Video" : "Image",
        accent: "#1A5C2A",
      }),
      imagePath: null,
      mediaType,
      caption: file.name || `${options.title} ${index + 1}`,
      album: "Health" as SiteStore["gallery"][number]["album"],
      year: galleryYears[0] || new Date().getFullYear(),
      createdAt: new Date().toISOString(),
    };
  });

  return linkedMedia.concat(uploadedMedia);
}

export function createGalleryCollection(input: {
  title: string;
  album: SiteStore["gallery"][number]["album"];
  year: number;
  mediaFiles?: File[];
  mediaLinks?: Array<{ url: string; type: GalleryMediaType }>;
}) {
  if (!galleryYears.includes(input.year)) {
    throw new Error(
      `Gallery year ${input.year} is not available yet. Add the year first, then upload the collection.`
    );
  }

  const collectionId = crypto.randomUUID();
  const media = resolveMockGalleryMedia({
    title: input.title,
    mediaFiles: input.mediaFiles,
    mediaLinks: input.mediaLinks,
  }).map((item) => ({
    ...item,
    collectionId,
    collectionTitle: input.title,
    album: input.album,
    year: input.year,
  }));

  if (media.length === 0) {
    throw new Error("Add at least one image or video before saving the collection.");
  }

  store.gallery.unshift(...media);
  return structuredClone(mapGalleryCollections(media)[0]);
}

export function uploadGalleryMedia(input: {
  album: SiteStore["gallery"][number]["album"];
  year: number;
  mediaLinks: Array<{ url: string; type: GalleryMediaType; path?: string }>;
}) {
  if (!galleryYears.includes(input.year)) {
    throw new Error(
      `Gallery year ${input.year} is not available yet. Add the year first, then upload the media.`
    );
  }

  const existing = store.gallery.find(
    (item) => item.album === input.album && item.year === input.year
  );
  const collectionId = existing?.collectionId || crypto.randomUUID();
  const internalLabel = `${input.album} ${input.year}`;
  const media = resolveMockGalleryMedia({
    title: internalLabel,
    mediaLinks: input.mediaLinks,
  }).map((item) => ({
    ...item,
    collectionId,
    collectionTitle: internalLabel,
    album: input.album,
    year: input.year,
  }));

  if (media.length === 0) {
    throw new Error("Choose at least one image or video before publishing.");
  }

  store.gallery.unshift(...media);
  return structuredClone(media);
}

export function updateGalleryCollection(
  collectionId: string,
  input: {
    title: string;
    album: SiteStore["gallery"][number]["album"];
    year: number;
  }
) {
  if (!galleryYears.includes(input.year)) {
    throw new Error(
      `Gallery year ${input.year} is not available yet. Add the year first, then save the collection.`
    );
  }

  let changed = false;

  store.gallery = store.gallery.map((item) => {
    if (item.collectionId !== collectionId) {
      return item;
    }

    changed = true;
    return {
      ...item,
      collectionTitle: input.title,
      album: input.album,
      year: input.year,
    };
  });

  return changed ? getGalleryCollectionById(collectionId) : null;
}

export function addGalleryCollectionMedia(
  collectionId: string,
  input: {
    mediaFiles?: File[];
    mediaLinks?: Array<{ url: string; type: GalleryMediaType }>;
  }
) {
  const collection = getGalleryCollectionById(collectionId);
  if (!collection) {
    throw new Error("We could not find that gallery collection.");
  }

  const media = resolveMockGalleryMedia({
    title: collection.title,
    mediaFiles: input.mediaFiles,
    mediaLinks: input.mediaLinks,
  }).map((item) => ({
    ...item,
    collectionId: collection.id,
    collectionTitle: collection.title,
    album: collection.album,
    year: collection.year,
  }));

  if (media.length === 0) {
    throw new Error("Add at least one image or video before updating the collection.");
  }

  store.gallery.unshift(...media);
  return getGalleryCollectionById(collectionId);
}

export function addGalleryYear(year: number) {
  if (galleryYears.includes(year)) {
    throw new Error(`Gallery year ${year} already exists.`);
  }

  galleryYears = [...galleryYears, year].sort((left, right) => right - left);
  return year;
}

export function removeGalleryItem(id: string) {
  store.gallery = store.gallery.filter((item) => item.id !== id);
}

export function removeGalleryCollection(collectionId: string) {
  store.gallery = store.gallery.filter((item) => item.collectionId !== collectionId);
}

export function removeGalleryYear(year: number) {
  const count = store.gallery.filter((item) => item.year === year).length;
  if (count > 0) {
    throw new Error(
      `Gallery year ${year} still has ${count} media item${count === 1 ? "" : "s"} assigned to it. Delete those collection item${count === 1 ? "" : "s"} first.`
    );
  }

  galleryYears = galleryYears.filter((item) => item !== year);
  return year;
}

export function listComments(postId?: string) {
  const items = postId
    ? store.comments.filter((comment) => comment.postId === postId)
    : store.comments;
  return structuredClone(
    [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  );
}

export function addComment(input: Pick<Comment, "postId" | "authorName" | "message">) {
  const item: Comment = {
    id: crypto.randomUUID(),
    status: "pending",
    createdAt: new Date().toISOString(),
    ...input,
  };

  store.comments.unshift(item);
  return structuredClone(item);
}

export function updateCommentStatus(id: string, status: Comment["status"]) {
  const target = store.comments.find((comment) => comment.id === id);
  if (!target) {
    return null;
  }

  target.status = status;
  return structuredClone(target);
}

export function deleteComment(id: string) {
  store.comments = store.comments.filter((comment) => comment.id !== id);
}

export function addContactMessage(input: {
  name: string;
  email: string;
  message: string;
}) {
  const item = {
    id: crypto.randomUUID(),
    name: input.name,
    email: input.email,
    message: input.message,
    createdAt: new Date().toISOString(),
  };

  store.contactMessages.unshift(item);
  return structuredClone(item);
}

export function addHelpApplication(
  input: Omit<
    HelpApplication,
    "id" | "status" | "createdAt" | "evidenceImageUrls" | "evidenceImagePaths"
  > & {
    evidenceImageFiles?: File[];
  }
) {
  const item: HelpApplication = {
    id: crypto.randomUUID(),
    status: "new",
    createdAt: new Date().toISOString(),
    name: input.name,
    phone: input.phone,
    location: input.location,
    helpType: input.helpType,
    description: input.description,
    howHeard: input.howHeard,
    evidenceImageUrls: (input.evidenceImageFiles || []).map((_, index) =>
      createPlaceholderImage({
        title: `${input.name} Evidence ${index + 1}`,
        subtitle: "Help application",
        accent: "#4A6650",
      })
    ),
    evidenceImagePaths: [],
  };

  store.applications.unshift(item);
  return structuredClone(item);
}

export function updateApplicationStatus(id: string, status: ApplicationStatus) {
  const target = store.applications.find((item) => item.id === id);
  if (!target) {
    return null;
  }
  target.status = status;
  return structuredClone(target);
}

export function deleteHelpApplication(id: string) {
  store.applications = store.applications.filter((item) => item.id !== id);
}

export function getApplicationById(id: string) {
  const item = store.applications.find((entry) => entry.id === id);
  return item ? structuredClone(item) : null;
}

export function addSponsorApplication(
  input: Omit<SponsorApplication, "id" | "status" | "createdAt">
) {
  const item: SponsorApplication = {
    id: crypto.randomUUID(),
    status: "pending",
    createdAt: new Date().toISOString(),
    ...input,
  };

  store.sponsorApplications.unshift(item);
  return structuredClone(item);
}

export function updateSponsorApplication(
  id: string,
  input: Partial<SponsorApplication>
) {
  const target = store.sponsorApplications.find((item) => item.id === id);
  if (!target) {
    return null;
  }

  Object.assign(target, input);
  return structuredClone(target);
}

export function getSponsorApplicationById(id: string) {
  const item = store.sponsorApplications.find((entry) => entry.id === id);
  return item ? structuredClone(item) : null;
}

export function deleteSponsorApplication(id: string) {
  store.sponsorApplications = store.sponsorApplications.filter(
    (item) => item.id !== id
  );
}

export function addPartnerApplication(
  input: Omit<PartnerApplication, "id" | "status" | "createdAt">
) {
  const item: PartnerApplication = {
    id: crypto.randomUUID(),
    status: "pending",
    createdAt: new Date().toISOString(),
    ...input,
  };

  store.partnerApplications.unshift(item);
  return structuredClone(item);
}

export function updatePartnerApplication(
  id: string,
  input: Partial<PartnerApplication>
) {
  const target = store.partnerApplications.find((item) => item.id === id);
  if (!target) {
    return null;
  }

  Object.assign(target, input);
  return structuredClone(target);
}

export function getPartnerApplicationById(id: string) {
  const item = store.partnerApplications.find((entry) => entry.id === id);
  return item ? structuredClone(item) : null;
}

export function deletePartnerApplication(id: string) {
  store.partnerApplications = store.partnerApplications.filter(
    (item) => item.id !== id
  );
}

export function updateSettings(input: Partial<SiteStore["settings"]>) {
  store.settings = {
    ...store.settings,
    ...input,
    impact: {
      ...store.settings.impact,
      ...input.impact,
    },
    contact: {
      ...store.settings.contact,
      ...input.contact,
    },
    organization: {
      ...store.settings.organization,
      ...input.organization,
    },
  };

  return structuredClone(store.settings);
}

export function listTeamMembers() {
  return structuredClone(sortTeamMembers(store.teamMembers));
}

export function getTeamMemberById(id: string) {
  const member = store.teamMembers.find((entry) => entry.id === id);
  return member ? structuredClone(member) : null;
}

export function createTeamMember(
  input: Omit<
    SiteStore["teamMembers"][number],
    "id" | "initials" | "createdAt"
  >
) {
  const nextMembers = input.isFeatured
    ? store.teamMembers.map((member) => ({ ...member, isFeatured: false }))
    : [...store.teamMembers];
  const item: SiteStore["teamMembers"][number] = {
    id: crypto.randomUUID(),
    initials: initialsFromName(input.name),
    createdAt: new Date().toISOString(),
    ...input,
  };

  store.teamMembers = sortTeamMembers([...nextMembers, item]);
  return structuredClone(item);
}

export function updateTeamMember(
  id: string,
  input: Partial<SiteStore["teamMembers"][number]>
) {
  const index = store.teamMembers.findIndex((entry) => entry.id === id);
  if (index === -1) {
    return null;
  }

  const current = store.teamMembers[index];
  const nextName = input.name ?? current.name;
  const nextIsFeatured = input.isFeatured ?? current.isFeatured;

  if (nextIsFeatured) {
    store.teamMembers = store.teamMembers.map((member) =>
      member.id === id ? member : { ...member, isFeatured: false }
    );
  }

  store.teamMembers[index] = {
    ...current,
    ...input,
    name: nextName,
    isFeatured: nextIsFeatured,
    initials: initialsFromName(nextName),
  };
  store.teamMembers = sortTeamMembers(store.teamMembers);

  const updated = store.teamMembers.find((entry) => entry.id === id);
  return updated ? structuredClone(updated) : null;
}

export function deleteTeamMember(id: string) {
  store.teamMembers = store.teamMembers.filter((entry) => entry.id !== id);
}

export function listProjects(status?: Project["status"]) {
  const items = status
    ? store.projects.filter((project) => project.status === status)
    : store.projects;
  return structuredClone(
    [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  );
}

export function getProjectById(id: string) {
  const item = store.projects.find((project) => project.id === id);
  return item ? structuredClone(item) : null;
}

export function createProject(input: Omit<Project, "id" | "createdAt">) {
  const item: Project = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };

  store.projects.unshift(item);
  return structuredClone(item);
}

export function updateProject(id: string, input: Partial<Project>) {
  const target = store.projects.find((item) => item.id === id);
  if (!target) {
    return null;
  }

  Object.assign(target, input);
  return structuredClone(target);
}

export function findUserByEmail(role: PortalRole, email: string) {
  const user = store.users.find(
    (entry) =>
      entry.role === role && entry.email.toLowerCase() === email.toLowerCase()
  );
  return user ? structuredClone(user) : null;
}

export function listUsersByRole(role: PortalRole) {
  return structuredClone(
    store.users.filter((user) => user.role === role && user.status === "active")
  );
}

export function getUserById(id: string) {
  const user = store.users.find((entry) => entry.id === id);
  return user ? structuredClone(user) : null;
}

export function updateUserProfile(
  id: string,
  input: Partial<MockCredentialUser> & { password?: string }
) {
  const user = store.users.find((entry) => entry.id === id);
  if (!user) {
    return null;
  }

  Object.assign(user, input);
  return structuredClone(user);
}

export function createPortalUser(input: {
  role: PortalRole;
  displayName: string;
  email: string;
  phone: string;
  orgName?: string;
  status?: "active" | "inactive";
  password?: string;
}) {
  const user: MockCredentialUser = {
    id: crypto.randomUUID(),
    role: input.role,
    displayName: input.displayName,
    orgName: input.orgName,
    email: input.email,
    phone: input.phone,
    isAdmin: input.role === "admin",
    status: input.status || "active",
    password: input.password || "",
    createdAt: new Date().toISOString(),
  };

  store.users.push(user);
  return structuredClone(user);
}

export function ensureSponsorAccess(userId: string, projectIds: string[]) {
  store.sponsorAccess = store.sponsorAccess.filter(
    (item) => item.sponsorUserId !== userId
  );
  projectIds.forEach((projectId) => {
    store.sponsorAccess.push({
      id: crypto.randomUUID(),
      sponsorUserId: userId,
      projectId,
      grantedAt: new Date().toISOString(),
    });
  });
}

export function ensurePartnerPermissions(userId: string, permissionKeys: string[]) {
  store.partnerPermissions = store.partnerPermissions.filter(
    (item) => item.partnerUserId !== userId
  );
  permissionKeys.forEach((permissionKey) => {
    store.partnerPermissions.push({
      id: crypto.randomUUID(),
      partnerUserId: userId,
      permissionKey,
      grantedAt: new Date().toISOString(),
    });
  });
}

export function getSponsorProjects(userId: string) {
  const ids = store.sponsorAccess
    .filter((item) => item.sponsorUserId === userId)
    .map((item) => item.projectId);
  return structuredClone(store.projects.filter((project) => ids.includes(project.id)));
}

export function getPartnerPermissionKeys(userId: string) {
  return structuredClone(
    store.partnerPermissions
      .filter((item) => item.partnerUserId === userId)
      .map((item) => item.permissionKey)
  );
}

export function listChatRoomsForUser(userId: string) {
  const roomIds = store.chatMembers
    .filter((member) => member.userId === userId)
    .map((member) => member.roomId);
  return structuredClone(store.chatRooms.filter((room) => roomIds.includes(room.id)));
}

export function getChatRoomById(roomId: string) {
  const room = store.chatRooms.find((item) => item.id === roomId);
  return room ? structuredClone(room) : null;
}

export function listChatMembersForRoom(roomId: string) {
  return structuredClone(
    store.chatMembers.filter((member) => member.roomId === roomId)
  );
}

export function isChatRoomMember(roomId: string, userId: string) {
  return store.chatMembers.some(
    (member) => member.roomId === roomId && member.userId === userId
  );
}

export function getMessagesForRoom(roomId: string, userId?: string) {
  if (userId && !isChatRoomMember(roomId, userId)) {
    return [];
  }

  return structuredClone(
    store.chatMessages
      .filter((message) => message.roomId === roomId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  );
}

export function createChatRoom(input: Omit<ChatRoom, "id" | "createdAt">) {
  const room: ChatRoom = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };
  store.chatRooms.unshift(room);
  store.chatMembers.push({
    id: crypto.randomUUID(),
    roomId: room.id,
    userId: input.createdBy,
    role: "owner",
    joinedAt: room.createdAt,
  });
  store.chatMembers.push({
    id: crypto.randomUUID(),
    roomId: room.id,
    userId: input.linkedUserId,
    role: "member",
    joinedAt: room.createdAt,
  });
  return structuredClone(room);
}

export function deleteChatRoom(roomId: string) {
  store.chatRooms = store.chatRooms.filter((room) => room.id !== roomId);
  store.chatMembers = store.chatMembers.filter((member) => member.roomId !== roomId);
  store.chatMessages = store.chatMessages.filter((message) => message.roomId !== roomId);
}

export function addChatMessage(input: {
  roomId: string;
  senderId: string;
  message: string;
}) {
  if (!isChatRoomMember(input.roomId, input.senderId)) {
    throw new Error("You do not have access to this chat room.");
  }

  const item = {
    id: crypto.randomUUID(),
    roomId: input.roomId,
    senderId: input.senderId,
    message: input.message,
    createdAt: new Date().toISOString(),
  };

  store.chatMessages.push(item);
  return structuredClone(item);
}

export function getDashboardSnapshot() {
  return {
    totalPosts: store.posts.length,
    newApplications: store.applications.filter((item) => item.status === "new")
      .length,
    pendingComments: store.comments.filter((item) => item.status === "pending")
      .length,
    galleryImages: store.gallery.length,
    activeSponsors: store.users.filter(
      (user) => user.role === "sponsor" && user.status === "active"
    ).length,
    activePartners: store.users.filter(
      (user) => user.role === "partner" && user.status === "active"
    ).length,
  };
}

export const storeAssets = {
  founderVisionImage,
  founderPortraitImage,
};

