import React, { Component } from 'react';
import { Loading } from 'react-simple-chatbot';
import { bc, bc_topic, dpr, dpr_topic, topic } from '../dummy/data.json';
// import 'jquery/dist/jquery.slim';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/js/bootstrap.bundle';

export default class Results extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            trigger: false,
            level: null,
            subject: null,
            results: []
        };

        this.triggerNext = this.triggerNext.bind(this);
    }

    async componentWillMount() {
        const { steps } = this.props;
        const { level, subject } = steps;

        const results = await Promise.all([
            (await Promise.all(bc.map(row => {
                try {
                    if (row.grade_id == level.value && row.major_id == subject.value) {
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
                    if (row.grade_id == level.value && row.major_id == subject.value) {
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
        const { loading, level, subject, results } = this.state;
        return (
            <div style={{ width: '100%' }}>
                { loading ? <Loading /> : results.length > 0 ? (
                    <div>
                        Berikut beberapa materi {subject.message} pada jenjang {level.message} yang Mejakitabot punya
                        {results.map(bcdpr => {
                            return bcdpr.map((row, i) => (
                                <div key={i} style={{ borderTop: '1px solid white', paddingBottom: '1rem' }}>
                                    <h3>{row.name}</h3>
                                    <small style={{ color: 'red' }}>{row.topic}</small>
                                    <img src={`/${row.image}`} alt='img' style={{ width: '100%', height: 'auto' }} />
                                </div>
                            ))
                        })}

                        {/* <div className="accordion mt-2" id="accordionExample">
                                    {results.map((bcdpr, parentI) => {
                                        return bcdpr.map((row, i) => (
                                        <div key={i + 1} className="card">
                                            <div
                                            className="card-header justify-content-center d-flex"
                                            id="headingOne"
                                            >
                                            <h2 className="mb-0">
                                                <button
                                                className="btn btn-link"
                                                type="button"
                                                data-toggle="collapse"
                                                data-target={`#bcdpr-${parentI}-${i + 1}`}
                                                aria-expanded="true"
                                                aria-controls="collapseOne"
                                                >
                                                {row.name}
                                                </button>
                                            </h2>
                                            </div>

                                            <div
                                            id={`bcdpr-${parentI}-${i + 1}`}
                                            className="collapse"
                                            aria-labelledby="headingOne"
                                            data-parent="#accordionExample"
                                            >
                                            <div className="card-body text-dark text-center">
                                                <small>{row.topic}</small>
                                                <img
                                                src={`/${row.image}`}
                                                alt="img"
                                                style={{ width: "100%", height: "100%" }}
                                                />
                                            </div>
                                            </div>
                                        </div>
                                        ));
                                    })}
                                    </div> */}
                    </div>

                ) : (
                        <div>Maaf yah, Mejakitabot tidak dapat menemukan apa yang kamu cari</div>
                    )}
            </div>
        );
    }
}