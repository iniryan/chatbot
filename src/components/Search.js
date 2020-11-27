import React, { Component } from 'react';
import { Loading } from 'react-simple-chatbot';
import { keyword_grade, keyword_major } from '../dummy/data.json';
import { bc, bc_topic, dpr, dpr_topic, topic } from '../dummy/data.json';
import "../styles/accordion.css";
import { v4 as uuidv4 } from 'uuid';

export default class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            trigger: false,
            level: null,
            subject: null,
            result: [],
            results: [],
            topicFound: []
        };

        this.triggerNext = this.triggerNext.bind(this);
    }

    async componentWillMount() {
        const { steps } = this.props;
        const { search } = steps;
        const values = search.value.trim().toLowerCase().split(/[\s,]+/)

        let grade = []
        let major = []

        keyword_grade.map(child_grade => {
            if (search.value.trim().toLowerCase().includes(child_grade.keyword.trim().toLowerCase())) grade = [child_grade]
        })
        keyword_major.map(child_major => {
            if (search.value.trim().toLowerCase().includes(child_major.keyword.trim().toLowerCase())) major = [child_major]
        })

        values.map(value => {
            keyword_grade.map(child_grade => {
                if (child_grade.keyword.trim().toLowerCase() === value) grade = [child_grade]
            })
            keyword_major.map(child_major => {
                if (child_major.keyword.trim().toLowerCase() === value) major = [child_major]
            })
        })

        const includes = await Promise.all([
            (await Promise.all(bc.map(child_bc => {
                if (child_bc.name.toLocaleLowerCase() == search.value.trim().toLowerCase()) {
                    return { id: child_bc.id, name: child_bc.name, image: child_bc.image }
                } else {
                    let splitTopic = null

                    const checkType = values.filter(value => value == 'dpr')
                    if (checkType.length > 0) {
                        return false
                    }

                    values.map(value => {
                        child_bc.name.trim().toLowerCase().split(/[\s,]+/).map(topic_word => {
                            if (!['bc', 'dpr'].includes(topic_word) && topic_word == value) {
                                splitTopic = { id: child_bc.id, name: child_bc.name, image: child_bc.image }
                            }
                        })
                    })
                    return splitTopic || false
                }
            }))).filter(bc => bc),
            (await Promise.all(dpr.map(child_dpr => {
                if (child_dpr.name.toLocaleLowerCase() == search.value.trim().toLowerCase()) {
                    return { id: child_dpr.id, name: child_dpr.name, image: child_dpr.image }
                } else {
                    let splitTopic = null

                    const checkType = values.filter(value => value == 'bc')
                    if (checkType.length > 0) {
                        return false
                    }

                    values.map(value => {
                        child_dpr.name.trim().toLowerCase().split(/[\s,]+/).map(topic_word => {
                            if (!['bc', 'dpr'].includes(topic_word) && topic_word == value) {
                                splitTopic = { id: child_dpr.id, name: child_dpr.name, image: child_dpr.image }
                            }
                        })
                    })
                    return splitTopic || false
                }
            }))).filter(dpr => dpr),
            (await Promise.all(topic.map(topic => {
                let results = []
                if (topic.name.toLowerCase().includes(search.value.toLowerCase()) || search.value.toLowerCase().includes(topic.name.toLowerCase())) {
                    const dprTopics = dpr_topic.filter(dpr => dpr.topic_id == topic.id)
                    const bcTopics = bc_topic.filter(bc => bc.topic_id == topic.id)

                    dprTopics.map(dprTopic => {
                        dpr.map(child_dpr => {
                            if (child_dpr.id == dprTopic.id) {
                                results = [...results, { topic: topic.name, name: child_dpr.name, image: child_dpr.image }]
                            }
                        })
                    })

                    bcTopics.map(bcTopic => {
                        bc.map(child_bc => {
                            if (child_bc.id == bcTopic.id) {
                                results = [...results, { topic: topic.name, name: child_bc.name, image: child_bc.image }]
                            }
                        })
                    })
                }
                return results.length > 0 ? results : false
            }))).filter(topic => topic),
        ])

        const level = grade.length > 0 ? [grade[0]] : []
        const subject = major.length > 0 ? [major[0]] : []
        const result = grade.length > 0 ? [grade[0]] : (major.length > 0 ? [major[0]] : [])
        const multi = level.length > 0 && subject.length > 0

        const topicFound = await Promise.all([
            includes[0].map(row => {
                const filter = bc_topic.filter(bc => bc.bc_id == row.id)
                const category = filter.length > 0 ? topic.filter((topic) => topic.id == filter[0].topic_id) : false
                return {
                    name: row.name,
                    image: row.image,
                    topic: category ? (category.length > 0 ? category[0].name : null) : null
                }
            }),
            includes[1].map(row => {
                const filter = dpr_topic.filter(dpr => dpr.dpr_id == row.id)
                const category = filter.length > 0 ? topic.filter((topic) => topic.id == filter[0].topic_id) : false
                return {
                    name: row.name,
                    image: row.image,
                    topic: category ? (category.length > 0 ? category[0].name : null) : null
                }
            }),
            ...includes[2]
        ])

        if (multi) {
            const results = await Promise.all([
                (await Promise.all(bc.map(row => {
                    try {
                        if (row.grade_id == level[0].grade_id && row.major_id == subject[0].major_id) {
                            const filter = bc_topic.filter(bc => bc.id == row.id)
                            const category = filter.length > 0 ? topic.filter((topic) => topic.id == filter[0].topic_id) : false
                            return {
                                name: row.name,
                                image: row.image,
                                topic: category ? (category.length > 0 ? category[0].name : null) : null
                            }
                        }
                        return false
                    } catch (error) {
                        return false
                    }
                }))).filter(bc => bc),
                (await Promise.all(dpr.map(row => {
                    try {
                        if (row.grade_id == level[0].grade_id && row.major_id == subject[0].major_id) {
                            const filter = dpr_topic.filter(dpr => dpr.id == row.id)
                            const category = filter.length > 0 ? topic.filter((topic) => topic.id == filter[0].topic_id) : false
                            return {
                                name: row.name,
                                image: row.image,
                                topic: category ? (category.length > 0 ? category[0].name : null) : null
                            }
                        }
                        return false
                    } catch (error) {
                        return false
                    }
                }))).filter(dpr => dpr),
            ])
            this.setState({ results });
        }
        this.setState({ trigger: 'subject_res', level, subject, topicFound, result, loading: false });

        if (this.state.result.length < 1) {
            this.props.triggerNextStep({ trigger: 're_search' })
        } else {
            if (multi) {
                this.props.triggerNextStep({ trigger: 're_search' });
            } else {
                if (topicFound[0].length > 0 || topicFound[1].length > 0 || topicFound.length > 2) {
                    this.props.triggerNextStep({ trigger: 're_search' });
                } else {
                    if (level.length > 0) {
                        this.props.triggerNextStep({ trigger: 'search_subject' })
                    } else if (subject.length > 0) {
                        this.props.triggerNextStep({ trigger: 'search_level' })
                    }
                }
            }
        }
    }

    triggerNext() {
        this.setState({ trigger: true }, () => {
            this.props.triggerNextStep();
        });
    }

    render() {
        const { loading, result, results, topicFound } = this.state;
        return (
            <div style={{ width: '100%' }}>
                { loading ? <Loading /> : (topicFound[0].length > 0 || topicFound[1].length > 0 ? (
                    <div style={{}}>
                    {topicFound.map((bcdpr, parentI) => {
                        if(parentI == 0 || parentI == 1) {
                      return bcdpr.map((row, i) => {
                          const uuid = uuidv4()
                          return (
                          <div key={i + 1} style={{ paddingTop: 12 }}>
                          <nav className="accordion arrows" style={{}}>
                              <input
                              type="radio"
                              name="accordion"
                              id={`bcdpr-${parentI}-${i + 1}-${uuid}`}
                              />
                              <section className="box">
                              <label
                                  className="box-title"
                                  htmlFor={`bcdpr-${parentI}-${i + 1}-${uuid}`}
                              >
                                  {row.name}
                              </label>
                              <label
                                  className="box-close"
                                  htmlFor="acc-close"
                              ></label>
                              <div className="box-content">
                                  <small>{row.topic}</small>
                                  <img
                                  src={`/${row.image}`}
                                  alt="img"
                                  style={{ width: "100%", height: "100%" }}
                                  />
                              </div>
                              </section>
                              <input type="radio" name="accordion" id="acc-close" />
                          </nav>
                          </div>
                          )
                      });
                }})}
                </div>
                ) : (topicFound.length > 2 && topicFound[2].length > 0 ? (
                    topicFound[2].map((row, i) => {
                        const uuid = uuidv4()
                        return (
                        <div key={i + 1} style={{ paddingTop: 12 }}>
                            <nav className="accordion arrows" style={{}}>
                                <input
                                type="radio"
                                name="accordion"    
                                id={`bcdpr-${i + 1}-${uuid}`}
                                />
                                <section className="box">
                                <label
                                    className="box-title"
                                    htmlFor={`bcdpr-${i + 1}-${uuid}`}
                                >
                                    {row.name}
                                </label>
                                <label className="box-close" htmlFor="acc-close"></label>
                                <div className="box-content">
                                    <small>{row.topic}</small>
                                    <img
                                    src={`/${row.image}`}
                                    alt="img"
                                    style={{ width: "100%", height: "100%" }}
                                    />
                                </div>
                                </section>
                                <input type="radio" name="accordion" id="acc-close" />
                            </nav>
                        </div>
                     ) })
                ) : (results.length > 0 ?
                    (<div style={{}}>
                        {results.map((bcdpr, parentI) => {
                          return bcdpr.map((row, i) => {
                              const uuid = uuidv4()
                              return (
                              <div key={i + 1} style={{ paddingTop: 12 }}>
                              <nav className="accordion arrows" style={{}}>
                                  <input
                                  type="radio"
                                  name="accordion"
                                  id={`bcdpr-${parentI}-${i + 1}-${uuid}`}
                                  />
                                  <section className="box">
                                  <label
                                      className="box-title"
                                      htmlFor={`bcdpr-${parentI}-${i + 1}-${uuid}`}
                                  >
                                      {row.name}
                                  </label>
                                  <label
                                      className="box-close"
                                      htmlFor="acc-close"
                                  ></label>
                                  <div className="box-content">
                                      <small>{row.topic}</small>
                                      <img
                                      src={`/${row.image}`}
                                      alt="img"
                                      style={{ width: "100%", height: "100%" }}
                                      />
                                  </div>
                                  </section>
                                  <input type="radio" name="accordion" id="acc-close" />
                              </nav>
                              </div>
                              )
                          });
                          })}
                    </div>) : (result.length > 0 ? `${result[0].keyword} ditemukan, tambahkan kata kunci lainnya` : 'Mejakitabot tidak dapat menemukan apa yang kamu cari'))))}
            </div>
        )
    }
}