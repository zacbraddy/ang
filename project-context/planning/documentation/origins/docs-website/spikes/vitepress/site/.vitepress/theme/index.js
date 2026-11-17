import DefaultTheme from 'vitepress/theme';
import StageCard from './StageCard.vue';
import './attribution.css';
import './palette.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) { app.component('StageCard', StageCard); },
};
