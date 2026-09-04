export default function copyright() {
    const nowa = new Date().getFullYear();

    return (
        <p>&amp; {nowa} Solaria, Inc.</p>
    );
}