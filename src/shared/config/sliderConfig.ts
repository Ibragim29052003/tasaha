// Импортируем тип Slide из Redux слайдера
import type { Slide } from '@/redux/slider/types';

// ------------------------------
// Пример слайдов для мужчин
// ------------------------------
export const menSlides: Slide[] = [
  {
    id: 1,
    imageUrl: '/images/men1.jpg',
    title: 'Новинка для мужчин',
    description: 'Стильная и удобная одежда для мужчин.',
    link: '#', // ссылка, если нужно перейти
  },
  {
    id: 2,
    imageUrl: '/images/men2.jpg',
    title: 'Летняя коллекция',
    description: 'Легкая и дышащая одежда для теплого сезона.',
    link: '#',
  },
  {
    id: 3,
    imageUrl: '/images/men3.jpg',
    title: 'Спортивный стиль',
    description: 'Удобная одежда для активного образа жизни.',
    link: '#',
  },
];

// ------------------------------
// Пример слайдов для женщин
// ------------------------------
export const womenSlides: Slide[] = [
  {
    id: 1,
    imageUrl: '/images/women1.jpg',
    title: 'Новинки для женщин',
    description: 'Модная и элегантная одежда для повседневной жизни.',
    link: '#',
  },
  {
    id: 2,
    imageUrl: '/images/women2.jpg',
    title: 'Весенняя коллекция',
    description: 'Легкие платья и яркие аксессуары.',
    link: '#',
  },
  {
    id: 3,
    imageUrl: '/images/women3.jpg',
    title: 'Спортивный стиль',
    description: 'Удобная и стильная спортивная одежда.',
    link: '#',
  },
];

// ------------------------------
// Общие слайды (для главной страницы)
// ------------------------------
export const generalSlides: Slide[] = [
  {
    id: 1,
    imageUrl: '/images/slide1.jpg',
    title: 'Распродажа сезона',
    description: 'Скидки до 50% на все товары!',
    link: '#',
  },
  {
    id: 2,
    imageUrl: '/images/slide2.jpg',
    title: 'Новая коллекция',
    description: 'Будь первым, кто оценит наши новинки.',
    link: '#',
  },
  {
    id: 3,
    imageUrl: '/images/slide3.jpg',
    title: 'Топ продаж',
    description: 'Лучшие товары, выбранные нашими клиентами.',
    link: '#',
  },
];
