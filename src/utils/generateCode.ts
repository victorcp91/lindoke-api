export default function generateCode(codeLength: number): string {
  const characters =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let generatedCode = '';
  for (let i = 0; i < codeLength; i += 1) {
    generatedCode += characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
  }
  return generatedCode;
}
