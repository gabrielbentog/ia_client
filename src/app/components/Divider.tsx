// components/Divider.tsx
export default function Divider() {
  return (
    <div className="flex items-center my-8">
      {/* linha à esquerda */}
      <div className="flex-grow border-t border-[#7a799c]" />
      {/* círculo central */}
      <div className="mx-4 h-4 w-4 rounded-full bg-[#d9d8f9]" />
      {/* linha à direita */}
      <div className="flex-grow border-t border-[#7a799c]" />
    </div>
  );
}
