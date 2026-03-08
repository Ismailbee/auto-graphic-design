export const businessCardTemplate = [
  {
    type: "rect",
    config: {
      x: 0,
      y: 0,
      width: 500,
      height: 300,
      fill: "#f9f9f9",
      cornerRadius: 20,
    },
  },
  {
    type: "text",
    config: {
      x: 160,
      y: 80,
      text: "Your Name",
      fontSize: 28,
      fontStyle: "bold",
      fill: "#333",
    },
  },
  {
    type: "text",
    config: {
      x: 160,
      y: 120,
      text: "Your Title",
      fontSize: 20,
      fill: "#777",
    },
  },
  {
    type: "image",
    config: {
      x: 20,
      y: 20,
      width: 100,
      height: 100,
      src: "/default-avatar.png", // put default avatar in /public
    },
  },
];
