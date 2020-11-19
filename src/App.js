import React, { Component } from 'react';
import { ThemeProvider } from 'styled-components';
import ChatBot from 'react-simple-chatbot';
import theme from './styles/theme';
import Results from './components/Results';
import Search from './components/Search';
import MultiSearch from './components/MultiSearch';
import RandomTopic from './components/RandomTopic';
import { major, grade, bc, bc_topic, dpr, dpr_topic, topic } from './dummy/data.json';

const bcdpr = [...bc_topic, ...dpr_topic]
const random = bcdpr[Math.floor(Math.random() * bcdpr.length)]

const filter = random.hasOwnProperty('bc_id') ? bc.filter((bc) => bc.id === random.bc_id) : dpr.filter((dpr) => dpr.id === random.dpr_id)
const fixed = filter.length > 0 ? filter[0] : null
const category = topic.filter((topic) => topic.id == random.topic_id)

class App extends Component {
  constructor() {
    super()
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <ChatBot 
        headerTitle="Mejakitabot"
        recognitionEnable={true}
        steps={[
          {
            id: '1',
            message: "Hai, aku Mejakitabot!",
            trigger: '2',
          },
          {
            id: '2',
            message: "Bolehkah Mejakitabot tahu apa yang ingin kamu lakukan?",
            trigger: '3',
          },
          {
            id: '3',
            options: [
              {
                value: 'lihat',
                label: 'Lihat materi pilihan',
                trigger: 'level1'
              },
              {
                value: 'cari',
                label: 'Cari materi',
                trigger: 'search_option'
              },
              {
                value: 'random',
                label: fixed ? fixed.name : '',
                trigger: 'random_topic'
              },
            ]
          },
          {
            id: 'random_topic',
            component: <RandomTopic item={{ name: fixed.name, image: fixed.image, category: category ? (category.length > 0 ? category[0].name : null) : null }} />,
            waitAction: true,
            asMessage: true,
            trigger: 'rewind'
          },
          {
            id: 'level1',
            message: "Sebelum mancari materi, bolehkah Mejakitabot tahu berada di jenjang manakah kamu?",
            trigger: 'level',
          },
          {
            id: 're_search',
            message: "Ingin mencari materi lain?",
            trigger: 're_search_option'
          },
          {
            id: 're_search_option',
            options: [
              {
                value: 'yes',
                label: 'Iya',
                trigger: 'search_option'
              },
              {
                value: 'no',
                label: 'Tidak',
                trigger: 'rewind'
              },
            ]
          },
          {
            id: 'search_option',
            message: "Silahkan kamu ketik apa yang ingin kamu cari?",
            trigger: 'search',
          },
          {
            id: 'search',
            user: true,
            trigger: 'search_data',
          },
          {
            id: 'search_data',
            component: <Search />,
            waitAction: true,
            asMessage: true,
          },
          {
            id: 'search_level',
            options: grade.map((level) => ({ label: level.short, value: level.id, trigger: 'multi_search' })),
          },
          {
            id: 'search_subject',
            options: major.map((subject) => ({ label: subject.short, value: subject.id, trigger: 'multi_search' })),
          },
          {
            id: 'level',
            options: grade.map((level) => ({ label: level.short, value: level.id, trigger: 'subject1' })),
          },
          {
            id: 'subject1',
            message: "Berikut beberapa mapel yang Mejakitabot punya",
            trigger: 'subject',
          },
          {
            id: 'subject',
            options: major.map((subject) => ({ label: subject.short, value: subject.id, trigger: 'results' })),
          },
          {
            id: 'multi_search',
            component: <MultiSearch />,
            waitAction: true,
            asMessage: true,
            trigger: 'rewind'
          },
          {
            id: 'results',
            component: <Results />,
            waitAction: true,
            asMessage: true,
            trigger: 'rewind'
          },
          {
            id: 'rewind',
            message: 'Apa kamu masih ingin melakukan hal lain?',
            trigger: 'rewind_option'
          },
          {
            id: 'rewind_option',
            options: [
              {
                value: 'yes',
                label: 'Iya',
                trigger: '2'
              },
              {
                value: 'no',
                label: 'Tidak, terima kasih',
                trigger: 'end'
              },
            ]
          },
          {
            id: 'end',
            message: 'Terima kasih telah menggunakan layanan dari Mejakitabot.',
            end: true
          },
        ]} />
      </ThemeProvider>
    )
  }
}

export default App;