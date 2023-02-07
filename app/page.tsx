'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Home() {
  const [request, setRequest] = useState<{
    days?: string
    city?: string
  }>({})
  let [itinerary, setItinerary] = useState<string>('')

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  async function hitAPI() {
    if (!request.city || !request.days) return
    setMessage('Building itinerary...')
    setLoading(true)
    setItinerary('')

    setTimeout(() => {
      setMessage('Getting closer ...')
    }, 7000)

    setTimeout(() => {
      setMessage('Almost there ...')
    }, 15000)

    const response = await fetch('/api/get-itinerary', {
      method: 'POST',
      body: JSON.stringify({
        days: request.days,
        city: request.city,
      }),
    })
    const json = await response.json()
    console.log(json)
    let itinerary = json.itinerary

    const response2 = await fetch('/api/get-points-of-interest', {
      method: 'POST',
      body: JSON.stringify({
        pointsOfInterestPrompt: json.pointsOfInterestPrompt,
      }),
    })
    const json2 = await response2.json()
    let pointsOfInterest = JSON.parse(json2.pointsOfInterest)

    pointsOfInterest.map((point) => {
      // itinerary = itinerary.replace(point, `<a target="_blank" rel="no-opener" href="https://www.google.com/search?q=${encodeURIComponent(point + ' ' + request.city)}">${point}</a>`)
      itinerary = itinerary.replace(
        point,
        `[${point}](https://www.google.com/search?q=${encodeURIComponent(
          point + ' ' + request.city
        )})`
      )
    })

    setItinerary(itinerary)
    setLoading(false)
  }

  let days = itinerary.split('Hari')

  if (days.length > 1) {
    days.shift()
  } else {
    days[0] = '1' + days[0]
  }

  return (
    <main>
      <div className='app-container'>
        <div
          style={styles.formContainer}
          className='form-container'
        >
          <Image
            src='/KemanaKita.png'
            alt='Logo'
            width={250}
            height={38}
            style={{ margin: '0 auto 24px' }}
          />
          <input
            style={styles.input}
            placeholder='Mau ke kota mana?'
            onChange={(e) =>
              setRequest((request) => ({
                ...request,
                city: e.target.value,
              }))
            }
          />
          <input
            style={styles.input}
            placeholder='Berapa hari?'
            onChange={(e) =>
              setRequest((request) => ({
                ...request,
                days: e.target.value,
              }))
            }
          />
          <button
            className='input-button'
            onClick={hitAPI}
          >
            Rencanakan
          </button>
        </div>
        <div className='results-container'>
          {loading && <p>{message}</p>}
          {itinerary &&
            days.map((day, index) => (
              // <p
              //   key={index}
              //   style={{marginBottom: '20px'}}
              //   dangerouslySetInnerHTML={{__html: `Day ${day}`}}
              // />
              <div
                style={{ marginBottom: '30px' }}
                key={index}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: (props) => {
                      return (
                        <a
                          target='_blank'
                          rel='no-opener'
                          href={props.href}
                        >
                          {props.children}
                        </a>
                      )
                    },
                  }}
                >
                  {`Day ${day}`}
                </ReactMarkdown>
              </div>
            ))}
        </div>
      </div>
    </main>
  )
}

const styles = {
  input: {
    padding: '10px 14px',
    marginBottom: '4px',
    outline: 'none',
    fontSize: '16px',
    width: '100%',
    border: 0,
    borderRadius: '8px',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    margin: '20px auto 0px',
  },
}
