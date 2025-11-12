export interface AdventureTurn {
  story: string;
  imagePrompt: string;
  choices: string[];
  inventory: string[];
  quest: string;
}

export interface StoryLog {
    story: string;
    image: string | null;
}
