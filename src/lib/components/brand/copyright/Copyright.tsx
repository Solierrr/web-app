export default function copyright() {
    const nowa = new Date().getFullYear();

    return (
        <p>&amp; {nowa} Elos, Inc.</p>
    );
}