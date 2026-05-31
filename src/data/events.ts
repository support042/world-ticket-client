import type { Event, Tournament, Venue } from '@/types'

export const events: Event[] = [
  {
    id: 'mexico-south-africa',
    title: 'Mexico vs South Africa',
    tournament: 'World Cup 2026',
    stage: 'Group A - Match 1',
    date: '2026-06-11',
    time: '14:00',
    venue: 'Estadio Azteca (Estadio Banorte)',
    city: 'Ciudad de México',
    state: 'Estado de Mexico',
    country: 'Mexico',
    ticketsLeftPercent: 4,
    priceRange: { min: 1966, max: 2484 },
    viewsLastHour: 38918,
    favorites: 44200,
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/web%201-Ycu6JP01IFPL6H5EXeSzn0SJzk0xwQ.png',
    teams: [
      { name: 'Mexico National Soccer Team', flag: '🇲🇽', code: 'MEX' },
      { name: 'South Africa National Soccer Team', flag: '🇿🇦', code: 'RSA' }
    ],
    categories: [
      { id: 1, name: 'Category 1', price: 2484, color: '#e91e63', available: 12 },
      { id: 2, name: 'Category 2', price: 2107, color: '#a67c52', available: 8 },
      { id: 3, name: 'Category 3', price: 1966, color: '#2196f3', available: 15 },
      { id: 4, name: 'Category 4', price: 2171, color: '#607d8b', available: 6 }
    ],
    sections: [
      {
        id: 'sec-623',
        name: '623',
        row: '10',
        price: 1963,
        available: 2,
        features: ['Clear view', 'Best price'],
        isPopular: true,
        ticketsSoldLastHour: 4,
        sectionImage: '/images/section-623.jpg'
      },
      {
        id: 'sec-526',
        name: '526 Sur',
        row: '8',
        price: 2160,
        available: 2,
        features: ['Clear view', 'Away fans section'],
        rating: 7.9,
        ratingLabel: 'Great',
        isFanFavorite: true,
        sectionImage: '/images/section-526.jpg'
      },
      {
        id: 'sec-525',
        name: '525 Sur',
        row: '6',
        price: 2107,
        available: 4,
        features: ['Clear view'],
        rating: 7.7,
        ratingLabel: 'Great',
        sectionImage: '/images/section-525.jpg'
      },
      {
        id: 'sec-101a',
        name: '101A',
        row: '5',
        price: 3680,
        available: 8,
        features: ['Premium view', 'Close to pitch'],
        sectionImage: '/images/section-101.jpg'
      },
      {
        id: 'sec-vip',
        name: 'VIP Lounge',
        row: 'VIP',
        price: 30337,
        available: 4,
        features: ['All-inclusive', 'Premium hospitality'],
        sectionImage: '/images/section-vip.jpg'
      }
    ]
  },
  {
    id: 'korea-czechia',
    title: 'South Korea vs Czechia',
    tournament: 'World Cup 2026',
    stage: 'Group A - Match 2',
    date: '2026-06-11',
    time: '21:00',
    venue: 'Estadio Akron (Chivas Stadium)',
    city: 'Zapopan',
    state: 'Estado de Jalisco',
    country: 'Mexico',
    ticketsLeftPercent: 8,
    priceRange: { min: 326, max: 1500 },
    viewsLastHour: 12450,
    favorites: 18500,
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/web%206-VBMBUQxV2viLHsdm037s3PPPXeVVUu.png',
    teams: [
      { name: 'Korea Republic National Team', flag: '🇰🇷', code: 'KOR' },
      { name: 'Czech Republic National Team', flag: '🇨🇿', code: 'CZE' }
    ],
    categories: [
      { id: 1, name: 'Category 1', price: 1500, color: '#e91e63', available: 20 },
      { id: 2, name: 'Category 2', price: 980, color: '#a67c52', available: 35 },
      { id: 3, name: 'Category 3', price: 650, color: '#2196f3', available: 50 },
      { id: 4, name: 'Category 4', price: 326, color: '#607d8b', available: 80 }
    ],
    sections: [
      {
        id: 'sec-t2-38',
        name: 'T2-38',
        row: 'E',
        price: 326,
        available: 2,
        features: ['Seated together', 'Clear view'],
        isLowestPrice: true,
        sectionImage: '/images/section-t2-38.jpg'
      },
      {
        id: 'sec-t1-15',
        name: 'T1-15',
        row: 'D',
        price: 450,
        available: 4,
        features: ['Clear view'],
        sectionImage: '/images/section-t1-15.jpg'
      }
    ]
  },
  {
    id: 'usa-england',
    title: 'USA vs England',
    tournament: 'World Cup 2026',
    stage: 'Group B - Match 1',
    date: '2026-06-12',
    time: '18:00',
    venue: 'MetLife Stadium',
    city: 'East Rutherford',
    state: 'New Jersey',
    country: 'USA',
    ticketsLeftPercent: 2,
    priceRange: { min: 3500, max: 15000 },
    viewsLastHour: 85000,
    favorites: 125000,
    image: '/images/usa-england.jpg',
    teams: [
      { name: 'USA National Team', flag: '🇺🇸', code: 'USA' },
      { name: 'England National Team', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', code: 'ENG' }
    ],
    categories: [
      { id: 1, name: 'Category 1', price: 15000, color: '#e91e63', available: 5 },
      { id: 2, name: 'Category 2', price: 8500, color: '#a67c52', available: 12 },
      { id: 3, name: 'Category 3', price: 5200, color: '#2196f3', available: 20 },
      { id: 4, name: 'Category 4', price: 3500, color: '#607d8b', available: 8 }
    ],
    sections: [
      {
        id: 'sec-ml-120',
        name: '120',
        row: '15',
        price: 3500,
        available: 2,
        features: ['End zone view'],
        sectionImage: '/images/section-120.jpg'
      }
    ]
  },
  {
    id: 'brazil-argentina',
    title: 'Brazil vs Argentina',
    tournament: 'World Cup 2026',
    stage: 'Round of 16',
    date: '2026-07-02',
    time: '20:00',
    venue: 'AT&T Stadium',
    city: 'Arlington',
    state: 'Texas',
    country: 'USA',
    ticketsLeftPercent: 1,
    priceRange: { min: 5000, max: 25000 },
    viewsLastHour: 150000,
    favorites: 280000,
    image: '/images/brazil-argentina.jpg',
    teams: [
      { name: 'Brazil National Team', flag: '🇧🇷', code: 'BRA' },
      { name: 'Argentina National Team', flag: '🇦🇷', code: 'ARG' }
    ],
    categories: [
      { id: 1, name: 'Category 1', price: 25000, color: '#e91e63', available: 2 },
      { id: 2, name: 'Category 2', price: 15000, color: '#a67c52', available: 6 },
      { id: 3, name: 'Category 3', price: 8500, color: '#2196f3', available: 10 },
      { id: 4, name: 'Category 4', price: 5000, color: '#607d8b', available: 4 }
    ],
    sections: [
      {
        id: 'sec-att-50',
        name: '50',
        row: '10',
        price: 5000,
        available: 2,
        features: ['Midfield view'],
        sectionImage: '/images/section-50.jpg'
      }
    ]
  },
  {
    id: 'portugal-brazil',
    title: 'Portugal vs Brazil',
    tournament: 'World Cup 2026',
    stage: 'Group C - Match 2',
    date: '2026-06-15',
    time: '19:00',
    venue: 'Hard Rock Stadium',
    city: 'Miami',
    state: 'Florida',
    country: 'USA',
    ticketsLeftPercent: 5,
    priceRange: { min: 1200, max: 4500 },
    viewsLastHour: 45000,
    favorites: 62000,
    image: '/images/portugal-brazil.jpg',
    teams: [
      { name: 'Portugal National Team', flag: '🇵🇹', code: 'POR' },
      { name: 'Brazil National Team', flag: '🇧🇷', code: 'BRA' }
    ],
    categories: [
      { id: 1, name: 'Category 1', price: 4500, color: '#e91e63', available: 15 },
      { id: 2, name: 'Category 2', price: 2800, color: '#a67c52', available: 25 },
      { id: 3, name: 'Category 3', price: 1200, color: '#2196f3', available: 40 }
    ],
    sections: []
  },
  {
    id: 'spain-germany',
    title: 'Spain vs Germany',
    tournament: 'World Cup 2026',
    stage: 'Group D - Match 1',
    date: '2026-06-16',
    time: '20:30',
    venue: 'Mercedes-Benz Stadium',
    city: 'Atlanta',
    state: 'Georgia',
    country: 'USA',
    ticketsLeftPercent: 3,
    priceRange: { min: 800, max: 3200 },
    viewsLastHour: 52000,
    favorites: 78000,
    image: '/images/spain-germany.jpg',
    teams: [
      { name: 'Spain National Team', flag: '🇪🇸', code: 'ESP' },
      { name: 'Germany National Team', flag: '🇩🇪', code: 'GER' }
    ],
    categories: [],
    sections: []
  },
  {
    id: 'japan-france',
    title: 'Japan vs France',
    tournament: 'World Cup 2026',
    stage: 'Group E - Match 1',
    date: '2026-06-17',
    time: '15:00',
    venue: 'BC Place',
    city: 'Vancouver',
    state: 'British Columbia',
    country: 'Canada',
    ticketsLeftPercent: 12,
    priceRange: { min: 450, max: 1800 },
    viewsLastHour: 28000,
    favorites: 35000,
    image: '/images/japan-france.jpg',
    teams: [
      { name: 'Japan National Team', flag: '🇯🇵', code: 'JPN' },
      { name: 'France National Team', flag: '🇫🇷', code: 'FRA' }
    ],
    categories: [],
    sections: []
  },
  {
    id: 'nigeria-ghana',
    title: 'Nigeria vs Ghana',
    tournament: 'World Cup 2026',
    stage: 'Group F - Match 1',
    date: '2026-06-18',
    time: '18:00',
    venue: 'SoFi Stadium',
    city: 'Inglewood',
    state: 'California',
    country: 'USA',
    ticketsLeftPercent: 6,
    priceRange: { min: 550, max: 2200 },
    viewsLastHour: 32000,
    favorites: 48000,
    image: '/images/nigeria-ghana.jpg',
    teams: [
      { name: 'Nigeria National Team', flag: '🇳🇬', code: 'NGR' },
      { name: 'Ghana National Team', flag: '🇬🇭', code: 'GHA' }
    ],
    categories: [],
    sections: []
  },
  {
    id: 'italy-belgium',
    title: 'Italy vs Belgium',
    tournament: 'World Cup 2026',
    stage: 'Group B - Match 2',
    date: '2026-06-12',
    time: '21:30',
    venue: 'Lincoln Financial Field',
    city: 'Philadelphia',
    state: 'Pennsylvania',
    country: 'USA',
    ticketsLeftPercent: 7,
    priceRange: { min: 750, max: 2900 },
    viewsLastHour: 41000,
    favorites: 55000,
    image: '/images/italy-belgium.jpg',
    teams: [
      { name: 'Italy National Team', flag: '🇮🇹', code: 'ITA' },
      { name: 'Belgium National Team', flag: '🇧🇪', code: 'BEL' }
    ],
    categories: [],
    sections: []
  },
  {
    id: 'canada-morocco',
    title: 'Canada vs Morocco',
    tournament: 'World Cup 2026',
    stage: 'Group G - Match 1',
    date: '2026-06-19',
    time: '16:00',
    venue: 'BMO Field',
    city: 'Toronto',
    state: 'Ontario',
    country: 'Canada',
    ticketsLeftPercent: 15,
    priceRange: { min: 380, max: 1500 },
    viewsLastHour: 22000,
    favorites: 29000,
    image: '/images/canada-morocco.jpg',
    teams: [
      { name: 'Canada National Team', flag: '🇨🇦', code: 'CAN' },
      { name: 'Morocco National Team', flag: '🇲🇦', code: 'MAR' }
    ],
    categories: [],
    sections: []
  },
  {
    id: 'uruguay-croatia',
    title: 'Uruguay vs Croatia',
    tournament: 'World Cup 2026',
    stage: 'Group H - Match 1',
    date: '2026-06-20',
    time: '19:00',
    venue: 'Levi\'s Stadium',
    city: 'Santa Clara',
    state: 'California',
    country: 'USA',
    ticketsLeftPercent: 9,
    priceRange: { min: 620, max: 2400 },
    viewsLastHour: 34000,
    favorites: 42000,
    image: '/images/uruguay-croatia.jpg',
    teams: [
      { name: 'Uruguay National Team', flag: '🇺🇾', code: 'URU' },
      { name: 'Croatia National Team', flag: '🇭🇷', code: 'CRO' }
    ],
    categories: [],
    sections: []
  }
]

export const tournaments: Tournament[] = [
  {
    id: 'world-cup-2026',
    name: 'FIFA World Cup 2026',
    description: 'Get ready for the ultimate soccer spectacle of 2026, spanning the United States, Canada, and Mexico, where 48 nations will compete across 104 matches in 39 unforgettable days. The tournament kicks off on June 11, 2026.',
    logo: '/images/world-cup-logo.png',
    bannerImage: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/web%201-Ycu6JP01IFPL6H5EXeSzn0SJzk0xwQ.png',
    totalEvents: 104,
    countries: ['USA', 'Canada', 'Mexico']
  }
]

export const venues: Venue[] = [
  {
    id: 'estadio-azteca',
    name: 'Estadio Azteca (Estadio Banorte)',
    city: 'Ciudad de México',
    country: 'Mexico',
    capacity: 87523,
    image: '/images/estadio-azteca.jpg',
    seatMapImage: '/images/azteca-seatmap.png'
  },
  {
    id: 'estadio-akron',
    name: 'Estadio Akron (Chivas Stadium)',
    city: 'Zapopan',
    country: 'Mexico',
    capacity: 49850,
    image: '/images/estadio-akron.jpg',
    seatMapImage: '/images/akron-seatmap.png'
  },
  {
    id: 'metlife-stadium',
    name: 'MetLife Stadium',
    city: 'East Rutherford',
    country: 'USA',
    capacity: 82500,
    image: '/images/metlife-stadium.jpg',
    seatMapImage: '/images/metlife-seatmap.png'
  }
]