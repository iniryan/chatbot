import React, { Component } from 'react';
import { Loading } from 'react-simple-chatbot';
import { keyword_grade, keyword_major } from '../dummy/data.json';
import { bc, bc_topic, dpr, dpr_topic, topic } from '../dummy/data.json';

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
                const filter = values.filter(value => child_bc.name.toLocaleLowerCase().includes(value.toLowerCase()))
                return filter.length > 0 ? { id: child_bc.id, name: child_bc.name, image: child_bc.image } : false
            }))).filter(bc => bc),
            (await Promise.all(dpr.map(child_dpr => {
                const filter = values.filter(value => child_dpr.name.toLocaleLowerCase().includes(value.toLowerCase()))
                return filter.length > 0 ? { id: child_dpr.id, name: child_dpr.name, image: child_dpr.image } : false
            }))).filter(dpr => dpr),
        ])

        const level = grade.length > 0 ? [grade[0]] : []
        const subject = major.length > 0 ? [major[0]] : []
        const result = grade.length > 0 ? [grade[0]] : (major.length > 0 ? [major[0]] : [])
        const multi = level.length > 0 && subject.length > 0
        const isTopic = level.length > 0 || subject.length > 0 ? false : (includes[0].length > 0 && includes[1].length > 0)

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
        } else if (isTopic) {
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
                })
            ])
            this.setState({ topicFound });
        }
        this.setState({ trigger: 'subject_res', level, subject, result, loading: false });
        if (this.state.result.length < 1) {
            this.props.triggerNextStep({ trigger: 're_search' })
        } else {
            if (multi) {
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

    triggerNext() {
        this.setState({ trigger: true }, () => {
            this.props.triggerNextStep();
        });
    }

    render() {
        const { loading, level, subject, result, results, topicFound } = this.state;
        return (
            <div style={{ width: '100%' }}>
                { loading ? <Loading /> : (topicFound.length > 0 ? (
                    topicFound.map(bcdpr => {
                        return bcdpr.map((row, i) => (
                            <div key={i} style={{ borderTop: '1px solid white', paddingBottom: '1rem' }}>
                                <h3>{row.name}</h3>
                                <small style={{ color: 'red' }}>{row.topic}</small>
                                <img src={`/${row.image}`} style={{ width: '100%', height: 'auto' }} />
                            </div>
                        ))
                    })
                ) : (results.length > 0 ?
                    (results.map(bcdpr => {
                        return bcdpr.map((row, i) => (
                            <div key={i} style={{ borderTop: '1px solid white', paddingBottom: '1rem' }}>
                                <h3>{row.name}</h3>
                                <small style={{ color: 'red' }}>{row.topic}</small>
                                <img src={`/${row.image}`} style={{ width: '100%', height: 'auto' }} />
                            </div>
                        ))
                    })) : (result.length > 0 ? `${result[0].keyword} ditemukan` : 'Mejakitabot tidak dapat menemukan apa yang kamu cari')))}
            </div>
        )
    }
}