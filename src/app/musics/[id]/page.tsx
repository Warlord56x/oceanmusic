export default function Page({ params }: { params: { id: number } }) {
  return <div>Music: {params.id}</div>;
}
