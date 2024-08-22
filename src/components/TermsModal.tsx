import React, { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { format } from 'date-fns'

export function TermsModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}) {
  const [isAgreed, setIsAgreed] = useState(false)

  useEffect(() => {
    const dateToNumber = (dateString: string): number => {
      const date = new Date(dateString)
      const time = date.getTime()
      return Math.round(time / 86400000)
    }

    const currentDate = format(new Date(), 'yyyy-MM-dd')
    const currentDateNumber = dateToNumber(currentDate)
    const cookieDate = localStorage.getItem('cookieSetDate')
    const cookieDateNumber = cookieDate ? dateToNumber(cookieDate) : null

    if (cookieDateNumber && currentDateNumber - cookieDateNumber >= 1) {
      setIsAgreed(false)
    }

    const isAgreedStorage = localStorage.getItem('isAgreedToTerms')
    if (isAgreedStorage) {
      setIsAgreed(true)
    }
  }, [])

  const handleAgree = () => {
    setIsAgreed(!isAgreed)
  }

  const handleSubmit = () => {
    localStorage.setItem('isAgreedToTerms', isAgreed.toString())
    localStorage.setItem('cookieSetDate', format(new Date(), 'yyyy-MM-dd'))
    setIsOpen(false)
  }

  return (
    // Use the `Transition` component at the root level
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => {}} static>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-grayscale" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto text-white">
          <style>
            {`
             .play-button {
               background-image: linear-gradient(to right, #FFFF34, #FFDD5E, #EBA054);
             }
           `}
          </style>
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-xl transform overflow-hidden bg-[#25224f] rounded-2xl py-24 px-8 text-left align-middle shadow-xl transition-all">
                <div className="flex flex-col gap-8 items-center">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-bold leading-6 text-gray-300 mb-8"
                  >
                    Welcome to IRA-Raffle
                  </Dialog.Title>
                  <ol className="text-base">
                    <li>
                      1. Age Requirement: You must be at least 18 years old, or
                      the legal age of majority in your jurisdiction. It is your
                      responsibility to ensure you meet this age requirement.
                    </li>
                    <li>
                      2. Responsible Gambling: Gambling involves risk. You may
                      lose ETH. Only gamble with money you can afford to lose.
                    </li>
                    <li>
                      3. Compliance with Local Laws: Gambling laws vary by
                      jurisdiction. It is your responsibility to ensure that
                      your use of our site complies with the laws and
                      regulations of your jurisdiction. IRA-Raffle does not
                      guarantee the legality of its services in your location.
                    </li>
                    <li>
                      4. Game Rules: Each game on IRA-Raffle has its own set
                      of rules. It is your responsibility to read and understand
                      these rules before playing.
                    </li>
                  </ol>
                  <div className="text-base">
                    By using IRA-Raffle, you accept full responsibility for
                    your actions and agree to abide by all terms and conditions
                    outlined in this disclaimer. If you do not agree with any
                    part of this disclaimer, please refrain from using our site.
                  </div>
                  <div className="checkbox flex flex-row w-full md:w-9/12">
                    <label className="checkbox-container pr-2">
                      <input type="checkbox" onChange={handleAgree} />
                    </label>
                    <div className="border-l py-2 px-4">
                      I confirm that I have read and agree to this message.
                    </div>
                  </div>
                  <button
                    className="flex flex-row gap-3 items-center text-black play-button disabled:!bg-gray-500 h-14 hover:scale-103 rounded-full relative outline outline-2 outline-offset-[6px] outline-yellow-300 hover:scale-105 disabled:opacity-60 px-8 py-4  text-lg"
                    onClick={handleSubmit}
                    disabled={!isAgreed}
                  >
                    Continue
                    <svg
                      width="19"
                      height="16"
                      viewBox="0 0 19 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M18.4177 8.70711C18.8083 8.31658 18.8083 7.68342 18.4177 7.29289L12.0538 0.928932C11.6633 0.538408 11.0301 0.538408 10.6396 0.928932C10.249 1.31946 10.249 1.95262 10.6396 2.34315L16.2964 8L10.6396 13.6569C10.249 14.0474 10.249 14.6805 10.6396 15.0711C11.0301 15.4616 11.6633 15.4616 12.0538 15.0711L18.4177 8.70711ZM0.552948 9H17.7106V7L0.552948 7V9Z"
                        fill="black"
                      />
                    </svg>
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
