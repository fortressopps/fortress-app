import { useLang as useLangContext } from '../context/LangContext';

export const useLang = () => {
  return useLangContext();
};
