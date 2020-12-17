import React, { Component } from 'react';
import { Loading } from 'react-simple-chatbot';
import { bc, bc_topic, dpr, dpr_topic, topic, keyword_grade, keyword_major } from '../dummy/data.json';
import '../styles/accordion.css';
import { v4 as uuidv4 } from 'uuid';

export default class MultiSearch extends Component {
    constructor(props) {
        super(props);
        console.log(props);
        this.state = {
            loading: true,
            trigger: false,
            results: []
        };

        this.triggerNext = this.triggerNext.bind(this);
    }

    async componentWillMount() {
        const { steps } = this.props;
        const { search_level, search_subject, level, subject, search } = steps;

        let grade = []
        let major = []

        keyword_grade.map(child_grade => {
            if (search.value.trim().toLowerCase().includes(child_grade.keyword.trim().toLowerCase())) grade = [child_grade]
        })
        keyword_major.map(child_major => {
            if (search.value.trim().toLowerCase().includes(child_major.keyword.trim().toLowerCase())) major = [child_major]
        })

        search.value.trim().toLowerCase().split(/[\s,]+/).map(value => {
            keyword_grade.map(child_grade => {
                if (child_grade.keyword.trim().toLowerCase() === value) grade = [child_grade]
            })
            keyword_major.map(child_major => {
                if (child_major.keyword.trim().toLowerCase() === value) major = [child_major]
            })
        })

        const levelSearch = grade.length > 0 ? grade[0].grade_id : null
        const subjectSearch = major.length > 0 ? major[0].major_id : null
        const results = await Promise.all([
            (await Promise.all(bc.map(row => {
                try {
                    if (levelSearch) {
                        if (row.grade_id == levelSearch && row.major_id == search_subject.value) {
                            const filter = bc_topic.filter(bc => bc.id == row.id)
                            const category = filter.length > 0 ? topic.filter((topic) => topic.id == filter[0].topic_id) : false
                            return {
                                name: row.name,
                                image: row.image,
                                link: row.link,
                                topic: category ? (category.length > 0 ? category[0].name : null) : null
                            }
                        }
                    } else {
                        if (row.grade_id == search_level.value && row.major_id == subjectSearch) {
                            const filter = bc_topic.filter(bc => bc.id == row.id)
                            const category = filter.length > 0 ? topic.filter((topic) => topic.id == filter[0].topic_id) : false
                            return {
                                name: row.name,
                                image: row.image,
                                link: row.link,
                                topic: category ? (category.length > 0 ? category[0].name : null) : null
                            }
                        }
                    }
                    return false
                } catch (error) {
                    return false
                }
            }))).filter(bc => bc),
            (await Promise.all(dpr.map(row => {
                try {
                    if (levelSearch) {
                        if (row.grade_id == levelSearch && row.major_id == search_subject.value) {
                            const filter = dpr_topic.filter(dpr => dpr.id == row.id)
                            const category = filter.length > 0 ? topic.filter((topic) => topic.id == filter[0].topic_id) : false
                            return {
                                name: row.name,
                                image: row.image,
                                link: row.link,
                                topic: category ? (category.length > 0 ? category[0].name : null) : null
                            }
                        }
                    } else {
                        if (row.grade_id == search_level.value && row.major_id == subjectSearch) {
                            const filter = dpr_topic.filter(dpr => dpr.id == row.id)
                            const category = filter.length > 0 ? topic.filter((topic) => topic.id == filter[0].topic_id) : false
                            return {
                                name: row.name,
                                image: row.image,
                                link: row.link,
                                topic: category ? (category.length > 0 ? category[0].name : null) : null
                            }
                        }
                    }
                    return false
                } catch (error) {
                    return false
                }
            }))).filter(dpr => dpr),
        ])
        this.setState({ level, subject, results, loading: false });
    }

    triggerNext() {
        this.setState({ trigger: true }, () => {
            this.props.triggerNextStep();
        });
    }

    componentDidMount() {
        this.props.triggerNextStep();
    }

    render() {
        const { loading, results } = this.state;
        return (
            <div style={{ width: '100%' }}>
                { loading ? <Loading /> : results.length > 0 ? (
                    <div style={{}}>
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
                                    <small><a href={row.link} style={{textDecoration: 'none'}}>lihat lebih banyak</a></small>
                                </div>
                                </section>
                                <input type="radio" name="accordion" id="acc-close" />
                            </nav>
                            </div>
                            )
                        });
                        })}
                  </div>

                ) : (
                        <div>Maaf yah, Mejakitabot tidak dapat menemukan apa yang kamu cari</div>
                    )}
            </div>
        );
    }
}