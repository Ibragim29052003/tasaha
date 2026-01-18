import { configureStore } from "@reduxjs/toolkit";
import sliderReducer from './slider/slice'
import { useDispatch, type TypedUseSelectorHook, useSelector as useReduxSelector } from "react-redux";

export const store = configureStore({
    reducer: {
        slider: sliderReducer,
    }
})

export type RootState = ReturnType<typeof store.getState>
// продвинутый UseDispatch с типизацией
export type AppDispatch = typeof store.dispatch // в AppDispatch будут все типы экшенов из всех слайсов

export const useAppDispatch = () => useDispatch<AppDispatch>() 

// useSelector - типизированный хук для получения состояния из редакса
export const useAppSelector: TypedUseSelectorHook<RootState> = useReduxSelector