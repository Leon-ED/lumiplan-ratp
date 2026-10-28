import { PassengerMessage } from "./types";

export const PASSENGER_MESSAGES: PassengerMessage[] = [
  {
    title: "Bienvenue",
    bgColor: "#6AB2E4",

    message:
      "Bienvenue sur les lignes<br/> Ile-de-France Mobilités<br/>exploitées par la RATP.",
    audio: "generic/welcome.mp3",
    duration: 13,
  },
  {
    title: "Validation",
    bgColor: "#82BC00",
    message:
      "N’oubliez pas de valider votre titre de transport dès la montée à bord,<br/>au risque d’être<br/>verbalisé,<br/>merci.",
    audio: "generic/validate.mp3",
  },
  {
    title: "Avancer vers le fond",
    bgColor: "#FD8204",
    message:
      "Afin d’accueillir<br/>de nouveaux voyageurs, merci d’avancer<br/>vers le fond du bus.",
    audio: "generic/advance.mp3",
  },
  {
    title: "Attention aux portes",
    bgColor: "#FD8204",
    message:
      "Merci de vous éloigner des portes,<br/>afin d’en permettre<br/>la fermeture.",
    audio: "generic/doors.mp3",
  },
  {
    title: "Poussettes",
    bgColor: "#FD8204",
    message:
      "Ce bus ne peut accueillir<br/>que 2 poussettes<br/>dépliées.<br/>Merci de replier<br/>toutes les<br/>autres.",
    audio: "generic/strollers.mp3",
    duration: 15,
  },
  {
    title: "Montée par l'avant",
    bgColor: "#FD8204",
    message:
      "Attention,<br/>nous vous rappelons<br/>que vous devez monter<br/>par la porte avant<br/>du bus.",
    audio: "generic/boarding.mp3",
  },
  {
    title: "Attention aux pickpockets",
    bgColor: "#FD8204",
    message:
      "Des pickpockets peuvent être présents,<br/>fermez bien vos sacs<br/>et soyez vigilants.",
    audio: "generic/pickpockets.mp3",
  },
  {
    title: "Stationnement pour régulation",
    bgColor: "#FD8204",
    message:
      "Merci de patienter.<br/>Nous stationnons quelques instants<br/>afin de maintenir une bonne régulation sur la ligne.",
    duration: 15,
  },
  {
    title: "Bus dévié",
    bgColor: "#FD8204",
    message:
      "Cet autobus doit être dévié<br/>en raison de travaux sur son trajet habituel.",
  },
  {
    title: "Terminus.",
    bgColor: "#FD8204",
    message:
      "Terminus,<br/>tous les voyageurs sont invités à descendre,<br/>merci.",
    subText:
      "This bus terminates here. <br/> Endhaltestelle. <br/> Fin de recorrido.",
    audio: "generic/terminus.mp3",
    duration: 20,
  },
];
