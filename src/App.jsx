import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './App.css';

export default function App() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    date: '',
    ageRange: '',
    category: '',
    tags: '',
    capacity: '',
    photo: '',
    comment: '',
  });

  const [searchFilters, setSearchFilters] = useState({
    keyword: '',
    location: '',
    category: '',
    fromDate: '',
    toDate: '',
    sortBy: '',
    onlyAvailable: false,
  });

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setSearchFilters({ ...searchFilters, [name]: checked });
    } else {
      setSearchFilters({ ...searchFilters, [name]: value });
    }
  };

  const handleFormChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onDateClick = date => {
    setSelectedDate(date);
    setFormData(prev => ({
      ...prev,
      date: date.toISOString().slice(0, 16)
    }));
    setShowModal(true);
  };

  const saveEvent = () => {
    setEvents([
      ...events,
      {
        id: Date.now(),
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()),
        capacity: Number(formData.capacity),
        participants: 0,
        comments: [formData.comment],
        photos: [formData.photo]
      }
    ]);
    setShowModal(false);
    setFormData({
      title: '',
      location: '',
      date: '',
      ageRange: '',
      category: '',
      tags: '',
      capacity: '',
      photo: '',
      comment: '',
    });
  };

  const joinEvent = id => {
    setEvents(events.map(e =>
      e.id === id && e.participants < e.capacity
        ? { ...e, participants: e.participants + 1 }
        : e
    ));
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const day = date.getDay();
      return day === 0 || day === 6 ? 'weekend-day' : 'weekday';
    }
  };

  const filteredEvents = events
    .filter(event => {
      const {
        keyword, location, category,
        fromDate, toDate, onlyAvailable
      } = searchFilters;

      const matchesKeyword = keyword === '' || event.title.includes(keyword) || event.tags.some(tag => tag.includes(keyword));
      const matchesLocation = location === '' || event.location.includes(location);
      const matchesCategory = category === '' || event.category === category;

      const eventDate = new Date(event.date);
      const matchesFrom = fromDate === '' || eventDate >= new Date(fromDate);
      const matchesTo = toDate === '' || eventDate <= new Date(toDate);

      const matchesAvailability = !onlyAvailable || event.participants < event.capacity;

      return matchesKeyword && matchesLocation && matchesCategory && matchesFrom && matchesTo && matchesAvailability;
    })
    .sort((a, b) => {
      if (searchFilters.sortBy === 'date') {
        return new Date(a.date) - new Date(b.date);
      } else if (searchFilters.sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  return (
    <div className="main-container">
      <h1 className="text-4xl font-bold">地域交流イベント</h1>

      <div className="form-and-calendar">
        <div className="search-form">
          <h3>🔍 詳細検索</h3>
          <div className="form-label-row">
            <label>キーワード:</label>
            <input type="text" name="keyword" value={searchFilters.keyword} onChange={handleInputChange} />
          </div>
          <div className="form-label-row">
            <label>開催場所:</label>
            <input type="text" name="location" value={searchFilters.location} onChange={handleInputChange} />
          </div>
          <div className="form-label-row">
            <label>開催日From:</label>
            <input type="date" name="fromDate" value={searchFilters.fromDate} onChange={handleInputChange} />
          </div>
          <div className="form-label-row">
            <label>開催日To:</label>
            <input type="date" name="toDate" value={searchFilters.toDate} onChange={handleInputChange} />
          </div>
          <div className="form-label-row">
            <label>ジャンル:</label>
            <select name="category" value={searchFilters.category} onChange={handleInputChange}>
              <option value="">指定なし</option>
              <option value="音楽">音楽</option>
              <option value="スポーツ">スポーツ</option>
              <option value="ワークショップ">ワークショップ</option>
            </select>
          </div>
          <div className="form-label-row">
            <label>並び替え:</label>
            <select name="sortBy" value={searchFilters.sortBy} onChange={handleInputChange}>
              <option value="">指定なし</option>
              <option value="date">日付順</option>
              <option value="title">タイトル順</option>
            </select>
          </div>
          <div className="form-label-row">
            <label>募集中のみ:</label>
            <input type="checkbox" name="onlyAvailable" checked={searchFilters.onlyAvailable} onChange={handleInputChange} />
          </div>
        </div>

        <div className="calendar-container">
          <Calendar onClickDay={onDateClick} tileClassName={tileClassName} />
        </div>
      </div>

      <ul>
        {filteredEvents.length === 0 && <li>該当するイベントはありません。</li>}
        {filteredEvents.map(event => (
          <li key={event.id} className="event-item" onClick={() => setSelectedEvent(event)}>
            <strong>{event.title}</strong> - {event.location} - {new Date(event.date).toLocaleString()}
          </li>
        ))}
      </ul>

      {/* イベント登録モーダル */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{selectedDate?.toDateString()} のイベント登録</h2>
            {[
              ['title', 'タイトル'],
              ['location', '場所'],
              ['date', '日時'],
              ['ageRange', '対象年齢'],
              ['category', 'カテゴリ'],
              ['tags', 'タグ（カンマ区切り）'],
              ['capacity', '定員（数値）'],
              ['photo', '写真URL'],
              ['comment', 'コメント']
            ].map(([name, label]) => (
              <div key={name} style={{ marginBottom: 10 }}>
                <label>{label}：</label><br />
                {name === 'comment' ? (
                  <textarea name={name} value={formData[name]} onChange={handleFormChange} rows={2} style={{ width: '100%' }} />
                ) : name === 'date' ? (
                  <input type="datetime-local" name={name} value={formData[name]} onChange={handleFormChange} />
                ) : (
                  <input type="text" name={name} value={formData[name]} onChange={handleFormChange} style={{ width: '100%' }} />
                )}
              </div>
            ))}

            <button onClick={saveEvent}>保存</button>
            <button onClick={() => setShowModal(false)} style={{ marginLeft: 10 }}>キャンセル</button>
          </div>
        </div>
      )}

      {/* イベント詳細モーダル */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{selectedEvent.title}</h2>
            <p><b>開催場所:</b> {selectedEvent.location}</p>
            <p><b>日時:</b> {new Date(selectedEvent.date).toLocaleString()}</p>
            <p><b>対象年齢:</b> {selectedEvent.ageRange}</p>
            <p><b>カテゴリ:</b> {selectedEvent.category}</p>
            <p><b>タグ:</b> {selectedEvent.tags.join(', ')}</p>
            <p><b>定員:</b> {selectedEvent.capacity}名（あと {selectedEvent.capacity - selectedEvent.participants} 名）</p>
            <div>
              {selectedEvent.photos[0]
                ? <img src={selectedEvent.photos[0]} alt="イベント写真" style={{ width: '100%', marginBottom: 10 }} />
                : <p>写真はありません</p>}
            </div>
            <div>
              <h3>コメント</h3>
              {selectedEvent.comments.map((c, i) => <p key={i}>- {c}</p>)}
            </div>
            <button onClick={() => joinEvent(selectedEvent.id)}>
              {selectedEvent.participants >= selectedEvent.capacity ? '満員' : '参加予定にする'}
            </button>
            <button onClick={() => setSelectedEvent(null)} style={{ marginLeft: 10 }}>閉じる</button>
          </div>
        </div>
      )}
    </div>
  );
}
