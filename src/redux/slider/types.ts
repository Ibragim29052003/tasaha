export type Slide = {
  id: number;
  imageUrl: string;
  title: string;
  description: string;
  link: string;
};

export interface SliderState {
  slides: Slide[];
  currentIndex: number;
  loading: boolean; // НА ПОДУМАТЬ еще подумаю, приходят ли с сервера или нет
  autoPlay: boolean; // включена ли автопрокрутка слайдов
  autoPlayInterval: number;
  showArrows: boolean;
}
