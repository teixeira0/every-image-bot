export default async function getPostText() {

  const arr = new Uint8ClampedArray(1000000);
  for (let i = 0; i < arr.length; i += 4) {
    arr[i + 0] = Math.random() * 256; // R value
    arr[i + 1] = Math.random() * 256; // G value
    arr[i + 2] = Math.random() * 256; // B value
    arr[i + 3] = 255; // A value
  }

  // Generate the text for your post here. You can return a string or a promise that resolves to a string
  return arr;
}