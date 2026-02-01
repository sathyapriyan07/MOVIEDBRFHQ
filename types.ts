
export interface Title {
  id: string;
  title: string;
  year: number;
  type: 'movie' | 'series';
  poster: string;
  overview: string;
  rating?: number;
  seasons?: Season[];
}

export interface Episode {
  id: string;
  number: number;
  title: string;
  overview: string;
  runtime: string;
  thumbnail: string;
}

export interface Season {
  id: string;
  number: number;
  name: string;
  episodes: Episode[];
}

export interface CastMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface Person {
  id: string;
  name: string;
  biography: string;
  avatar: string;
  credits: Title[];
}

export interface HomeSection {
  id: string;
  title: string;
  items: Title[];
}
