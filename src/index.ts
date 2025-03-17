import { App } from './components/app';
import './styles/main.css';

function initApp(): void {
  const app = new App();

  const appElement = app.render();
  document.body.append(appElement);
}

document.addEventListener('DOMContentLoaded', initApp);
