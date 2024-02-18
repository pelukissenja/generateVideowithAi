import nlp from "compromise"

export const generateDesc = (prompt) => {
    const doc = nlp(prompt);
    const keyword = doc.match('#Noun').out('text')
    const desk = `video tentang ${keyword}`
    return desk;
}

export default generateDesc;