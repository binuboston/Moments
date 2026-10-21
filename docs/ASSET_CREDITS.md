# Asset credits

## Background music (`public/music`)

Guests hear these tracks after opening an invitation (see `features/music/library.ts`). Every one is free to use anywhere, with no attribution or licence fee: the composition is public domain (the composer died more than 70 years ago), and the recording is either public domain or released under CC0.

The bundled files are edited copies: leading silence removed, trimmed to about 2 to 4 minutes, faded in and out, loudness-matched (EBU R128, −19 LUFS) and encoded as 96 kbps MP3.

| File | Work | Performer | Recording licence | Source |
| --- | --- | --- | --- | --- |
| `clair-de-lune.mp3` | Debussy, *Clair de Lune* | Laurens Goedhart, piano (2011) | Public domain (released by the performer) | [Commons](https://commons.wikimedia.org/wiki/File:Clair_de_lune_(Claude_Debussy)_Suite_bergamasque.ogg) |
| `nocturne-op-9-no-2.mp3` | Chopin, Nocturne Op. 9 No. 2 | Peter Johnston, piano (Musopen) | CC0 | [Commons](https://commons.wikimedia.org/wiki/File:Chopin_Nocturne_No._2_in_E_Flat_Major,_Op._9.ogg) |
| `gymnopedie-no-1.mp3` | Satie, *Gymnopédie No. 1* | Robin Alciatore, piano (Musopen) | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Erik_Satie_-_gymnopedies_-_la_1_ere._lent_et_douloureux.ogg) |
| `air-on-the-g-string.mp3` | Bach, Air from Suite No. 3, BWV 1068 | Air Force Strings, U.S. Air Force Band | Public domain (U.S. federal government work) | [Commons](https://commons.wikimedia.org/wiki/File:Air_-_Air_Force_Strings_-_United_States_Air_Force_Band.mp3) |
| `romance-k525.mp3` | Mozart, *Eine kleine Nachtmusik* K. 525, II. Romance | Musopen archive recording | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Mozart_K525_Serenade_in_G_Major_2_-_Romance.ogg) |
| `allegro-k525.mp3` | Mozart, *Eine kleine Nachtmusik* K. 525, I. Allegro | Musopen archive recording | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Mozart_K525_Serenade_in_G_Major_1_-_Allegro.ogg) |
| `wedding-march.mp3` | Mendelssohn, Wedding March, Op. 61 | Musopen archive recording | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:A_Midsummer_Night%27s_Dream_Op._61_Wedding_March_(Mendelssohn)_European_Archive.ogg) |
| `maple-leaf-rag.mp3` | Joplin, *Maple Leaf Rag* | Strolling Strings, U.S. Air Force Band | Public domain (U.S. federal government work) | [Commons](https://commons.wikimedia.org/wiki/File:Maple_Leaf_Rag_-_Strolling_Strings_-_United_States_Air_Force_Band.mp3) |
| `veena-reethigowlai.mp3` | Muthuswami Dikshitar, *Sri Nilotpala Nayike* (raga Reethigowla) | L. Ramakrishnan, veena | CC0 | [Commons](https://commons.wikimedia.org/wiki/File:Shri_Nilotpala_Nayike,_rendered_on_the_Veena_by_L_Ramakishnan.ogg) |

### Adding a track

1. Check both the **composition** and the **recording** are free. Public domain or CC0 only: CC BY needs on-screen attribution, and CC BY-SA, NC or "royalty-free" licences add conditions guests' shares could break. Avoid uploads re-hosted from YouTube or commercial albums, even when labelled public domain.
2. Process it the same way (`ffmpeg … -af "silenceremove=…,loudnorm=I=-19:TP=-2:LRA=11,afade…" -b:a 96k`), and save it as `public/music/<id>.mp3`.
3. Add an entry to `MUSIC_LIBRARY` and a row here. Never rename or remove an id: published invitations store it (an unknown id just plays nothing).
