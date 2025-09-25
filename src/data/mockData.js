// Mock data for the Newsline MVP project

// News Articles Mock Data
export const newsArticles = [
  {
    id: 1,
    title: "Nigeria's Economy Shows Strong Recovery in Q3",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80",
    category: "Nigeria News",
    timestamp: "2024-01-15T10:30:00Z",
    description: "The Nigerian economy demonstrates resilience with significant growth indicators showing positive trends across multiple sectors.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  },
  {
    id: 2,
    title: "Global Climate Summit Reaches Historic Agreement",
    image: "https://images.unsplash.com/photo-1569163139394-de44cb55b99a?auto=format&fit=crop&w=800&q=80",
    category: "International News",
    timestamp: "2024-01-14T14:20:00Z",
    description: "World leaders unite on comprehensive climate action plan with binding commitments for carbon neutrality by 2050.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  },
  {
    id: 3,
    title: "Lagos State Unveils New Transportation Initiative",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    category: "Nigeria News",
    timestamp: "2024-01-13T09:15:00Z",
    description: "Revolutionary transportation system promises to reduce traffic congestion by 40% in major Lagos corridors.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  },
  {
    id: 4,
    title: "Tech Giants Announce Major AI Partnership",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    category: "Technology",
    timestamp: "2024-01-12T16:45:00Z",
    description: "Leading technology companies form alliance to develop ethical AI standards and promote responsible innovation.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  },
  {
    id: 5,
    title: "World Cup 2026 Preparation Updates",
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=800&q=80",
    category: "Sports",
    timestamp: "2024-01-11T12:30:00Z",
    description: "FIFA announces infrastructure developments and venue selections for the upcoming World Cup tournament.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  },
  {
    id: 6,
    title: "Nigerian Space Programme Achieves Milestone",
    image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?auto=format&fit=crop&w=800&q=80",
    category: "Nigeria News",
    timestamp: "2024-01-10T11:00:00Z",
    description: "NASRDA successfully launches communications satellite, marking significant advancement in Nigeria's space capabilities.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  }
];

// Movies Mock Data
export const moviesData = [
  {
    id: 1,
    title: "The King's Gambit",
    poster: "https://images.unsplash.com/photo-1489599843821-bee37ee19e99?auto=format&fit=crop&w=400&q=80",
    year: 2023,
    category: "Nollywood",
    genre: ["Drama", "Thriller"],
    language: "English",
    description: "A gripping tale of power, betrayal, and redemption set in modern-day Lagos.",
    downloadLink: "#mock-download",
    rating: 4.5
  },
  {
    id: 2,
    title: "Seoul Dreams",
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=400&q=80",
    year: 2023,
    category: "Korean Drama",
    genre: ["Romance", "Drama"],
    language: "Korean",
    description: "A heartwarming story of love and ambition in the bustling streets of Seoul.",
    downloadLink: "#mock-download",
    rating: 4.8
  },
  {
    id: 3,
    title: "Mumbai Nights",
    poster: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?auto=format&fit=crop&w=400&q=80",
    year: 2023,
    category: "Bollywood",
    genre: ["Action", "Drama"],
    language: "Hindi",
    description: "An action-packed thriller showcasing the vibrant life of Mumbai's underworld.",
    downloadLink: "#mock-download",
    rating: 4.2
  },
  {
    id: 4,
    title: "Dragon's Legacy",
    poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=400&q=80",
    year: 2022,
    category: "Chinese Drama",
    genre: ["Fantasy", "Adventure"],
    language: "Mandarin",
    description: "Epic fantasy adventure following ancient Chinese legends and mythology.",
    downloadLink: "#mock-download",
    rating: 4.6
  },
  {
    id: 5,
    title: "Avengers: New Dawn",
    poster: "https://images.unsplash.com/photo-1635863138275-d9864d32faae?auto=format&fit=crop&w=400&q=80",
    year: 2023,
    category: "Hollywood",
    genre: ["Action", "Sci-Fi"],
    language: "English",
    description: "The next chapter in the Marvel Cinematic Universe with new heroes rising.",
    downloadLink: "#mock-download",
    rating: 4.7
  }
];

// Network Plans Mock Data
export const networkPlans = {
  MTN: {
    daily: [
      { name: "1GB Daily", price: 200, validity: "24 hours" },
      { name: "2GB Daily", price: 350, validity: "24 hours" }
    ],
    weekly: [
      { name: "5GB Weekly", price: 1000, validity: "7 days" },
      { name: "10GB Weekly", price: 1800, validity: "7 days" }
    ],
    monthly: [
      { name: "20GB Monthly", price: 5000, validity: "30 days" },
      { name: "50GB Monthly", price: 10000, validity: "30 days" }
    ],
    yearly: [
      { name: "500GB Yearly", price: 100000, validity: "365 days" }
    ]
  },
  Airtel: {
    daily: [
      { name: "1.5GB Daily", price: 200, validity: "24 hours" },
      { name: "3GB Daily", price: 400, validity: "24 hours" }
    ],
    weekly: [
      { name: "6GB Weekly", price: 1200, validity: "7 days" },
      { name: "12GB Weekly", price: 2000, validity: "7 days" }
    ],
    monthly: [
      { name: "25GB Monthly", price: 5500, validity: "30 days" },
      { name: "60GB Monthly", price: 11000, validity: "30 days" }
    ],
    yearly: [
      { name: "600GB Yearly", price: 120000, validity: "365 days" }
    ]
  },
  Glo: {
    daily: [
      { name: "1.2GB Daily", price: 200, validity: "24 hours" },
      { name: "2.5GB Daily", price: 380, validity: "24 hours" }
    ],
    weekly: [
      { name: "7GB Weekly", price: 1300, validity: "7 days" },
      { name: "15GB Weekly", price: 2200, validity: "7 days" }
    ],
    monthly: [
      { name: "30GB Monthly", price: 6000, validity: "30 days" },
      { name: "75GB Monthly", price: 12000, validity: "30 days" }
    ],
    yearly: [
      { name: "800GB Yearly", price: 130000, validity: "365 days" }
    ]
  },
  "9Mobile": {
    daily: [
      { name: "1GB Daily", price: 200, validity: "24 hours" },
      { name: "2GB Daily", price: 360, validity: "24 hours" }
    ],
    weekly: [
      { name: "4GB Weekly", price: 900, validity: "7 days" },
      { name: "8GB Weekly", price: 1600, validity: "7 days" }
    ],
    monthly: [
      { name: "15GB Monthly", price: 4000, validity: "30 days" },
      { name: "40GB Monthly", price: 8500, validity: "30 days" }
    ],
    yearly: [
      { name: "400GB Yearly", price: 90000, validity: "365 days" }
    ]
  }
};

// Social Media Mock Posts
export const socialMediaPosts = [
  {
    id: 1,
    userId: 1,
    username: "johndoe",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80",
    content: "Beautiful sunset from my balcony today! 🌅",
    mediaUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
    mediaType: "image",
    timestamp: "2024-01-15T18:30:00Z",
    likes: 42,
    comments: 5,
    shares: 2,
    isLiked: false
  },
  {
    id: 2,
    userId: 2,
    username: "janedoe",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b1e5?auto=format&fit=crop&w=100&q=80",
    content: "Amazing weekend adventure! Can't wait to share more.",
    mediaUrl: "https://sample-videos.com/zip/10/mp4/480/SampleVideo_480x270_1mb.mp4",
    mediaType: "video",
    timestamp: "2024-01-14T12:15:00Z",
    likes: 128,
    comments: 12,
    shares: 8,
    isLiked: true
  }
];

// Games Mock Data
export const gamesData = [
  {
    id: 1,
    name: "Tic-Tac-Toe",
    description: "Classic three-in-a-row game",
    thumbnail: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?auto=format&fit=crop&w=400&q=80",
    component: "TicTacToe"
  },
  {
    id: 2,
    name: "Snake Game",
    description: "Control the snake to eat food and grow",
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=400&q=80",
    component: "SnakeGame"
  },
  {
    id: 3,
    name: "Memory Match",
    description: "Match pairs of cards to test your memory",
    thumbnail: "https://images.unsplash.com/photo-1606092146916-d599e0c72d15?auto=format&fit=crop&w=400&q=80",
    component: "MemoryMatch"
  }
];