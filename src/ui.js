// game.js
export const displayTime = document.querySelector('.info-panel .display-time');
export const displaySpeed = document.querySelector('.info-panel .display-speed');
export const overOverlay = document.querySelector('#over-overlay');
export const overOverlayMessage = document.querySelector('#over-overlay .over-overlay__text');
export const infoObjectOverlay = document.querySelector('.info-building-overlay');
export const infoObjectCloseBtn = document.querySelector('.info-building-overlay .panel-close-btn');
export const buildingsObjects = [
    'House-Red', 'House-Purple', 'House-Blue', 'House-2Story', 'Market-Stall', 
    'Tombstone-1', 'Farm-Carrot', 'Farm-Wheat', 'Farm-Cabbage'
];

export const infoPanelClock = document.querySelector('.info-panel .clock-box');
export const infoPanelClockIcon = document.querySelector('.info-panel svg.lucide-clock-4')
export const infoPanelNoClockIcon = document.querySelector('.info-panel svg.lucide-alarm-clock-off')
export const delayBox = document.querySelector('.info-panel .delay-box');
// scene.js
export const gameWindow = document.getElementById('game-window');
export const displayPop = document.querySelector('.info-panel .display-pop');
export const displayFood = document.querySelector('.info-panel .display-food');
export const displayNeedFood = document.querySelector('.info-panel .display-starve');
export const displayDead = document.querySelector('.info-panel .display-dead');
export const displayDelay = document.querySelector('.info-panel .display-delay');
export const displayDelayUI = document.querySelector('.delay-ui');
export const bulldozeSelected = document.querySelector('.bulldoze-btn');
export const displayFunds = document.querySelector('.info-panel .display-funds');
export const displayDebt = document.querySelector('.info-panel .display-debt');
export const houses = ['House-Red', 'House-Purple', 'House-Blue', 'House-2Story'];
export const firstHouses = ['House-Red', 'House-Purple', 'House-Blue'];
export const bigHouses = ['House-2Story'];
export const farms = ['Farm-Wheat', 'Farm-Carrot', 'Farm-Cabbage'];
export const commerce = ['Market-Stall'];


