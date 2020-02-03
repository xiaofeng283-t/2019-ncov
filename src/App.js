import React, { useState, Suspense, useEffect } from 'react'
import keyBy from 'lodash.keyby'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'

import all from './data/overall'
import _provinces from './data/area'
import _provinces_2 from './data/area2'

import Tag from './Tag'

import './App.css'
import axios from 'axios'

dayjs.extend(relativeTime)

// 兼容区/县级
var provinces;
var _p = window.location.pathname.slice(1)
console.log("_p=")
console.log(_p)
console.log(window.location.pathname)
var _p_array = _p.split("/")
var area_array = ['lishui', 'ningbo']
var area_name_array = ['丽水', '宁波']
if(_p_array.length > 1){
  provinces = _provinces_2
}else{
  provinces = _provinces
}
console.log("provinces=")
console.log(provinces)

const Map = React.lazy(() => import('./Map'))

const provincesByName = keyBy(provinces, 'name')
const provincesByPinyin = keyBy(provinces, 'pinyin')

const fetcher = (url) => axios(url).then(data => {
  return data.data.data
})

function New ({ title, summary, sourceUrl, pubDate, pubDateStr }) {
  return (
    <div className="new">
      <div className="new-date">
        <div className="relative">
          {dayjs(pubDate).locale('zh-cn').fromNow()}
        </div>
        {dayjs(pubDate).format('YYYY-MM-DD HH:mm')}
      </div>
      <a className="title" href={sourceUrl}>{ title }</a>
      <div className="summary">{ summary.slice(0, 100) }...</div>
    </div>
  )
}

function News ({ province }) {
  const [len, setLen] = useState(8)
  const [news, setNews] = useState([])

  useEffect(() => {
    fetcher(`https://file1.dxycdn.com/2020/0130/492/3393874921745912795-115.json?t=${46341925 + Math.random()}`).then(news => {
      setNews(news)
    })
  }, [])

  return (
    <div className="card">
      <h2>实时动态</h2>
      {
        news
          .filter(n => province ? province.provinceShortName === (n.provinceName && n.provinceName.slice(0, 2)) : true)
          .slice(0, len)
          .map(n => <New {...n} key={n.id} />)
      }
      <div className="more" onClick={() => { setLen() }}>点击查看全部动态</div>
    </div>
  )
}

function Summary () {
  return (
    <div className="card info">
      <h2>信息汇总</h2>
      <li>
        <a href="https://m.yangshipin.cn/static/2020/c0126.html">疫情24小时 | 与疫情赛跑</a>
      </li>
      <li><a href="http://2019ncov.nosugartech.com/">确诊患者同行查询工具</a></li>
      <li><a href="https://news.qq.com/zt2020/page/feiyan.htm">腾讯新闻新冠疫情实时动态</a></li>
      <li><a href="https://3g.dxy.cn/newh5/view/pneumonia">丁香园新冠疫情实时动态</a></li>
      <li><a href="https://vp.fact.qq.com/home">新型冠状病毒实时辟谣</a></li>
      <li><a href="https://promo.guahao.com/topic/pneumonia">微医抗击疫情实时救助</a></li>
    </div>
  )
}

function Stat ({ modifyTime, confirmedCount, suspectedCount, deadCount, curedCount, seriousIncr, deadline_time, source, name }) {
  return (
    <div className="card">
      <h2>
        统计 {name ? `· ${name}` : false}
        <span className="due">
          {area_name_array.indexOf(name) > -1 ? `截止时间：${deadline_time}，数据来源：${source}`  : "更新时间：" + dayjs(modifyTime).format('YYYY-MM-DD HH:mm')}

        </span>
      </h2>
      <div className="row">
        <Tag number={confirmedCount}>
          确诊
        </Tag>
        <Tag number={suspectedCount || '-'}>
          疑似
        </Tag>
        <Tag number={seriousIncr || '-'}>
          重症
        </Tag>
        <Tag number={deadCount}>
          死亡
        </Tag>
        <Tag number={curedCount}>
          治愈
        </Tag>
 
        {/* <Tag number={0}>
          密切接触
        </Tag>
        <Tag number={0}>
          医学观察
        </Tag>
        <Tag number={0}>
          解除医学观察
        </Tag> */}
        
      </div>
    </div>
  )
}

function Fallback () {
  return (
    <div className="fallback">
      <div>
        代码仓库: <a href="https://github.com/xiaofeng283-t/2019-ncov">xiaofeng283-t/2019-ncov</a>
      </div>
      <script type="text/javascript">var cnzz_protocol = (("https:" == document.location.protocol) ? "https://" : "http://");document.write(unescape("%3Cspan id='cnzz_stat_icon_1278597257'%3E%3C/span%3E%3Cscript src='" + cnzz_protocol + "s4.cnzz.com/z_stat.php%3Fid%3D1278597257' type='text/javascript'%3E%3C/script%3E"));</script>
    </div>
  )
}

function Area ({ area, onChange }) {
  const renderArea = () => {
    return area.map(x => (
      <div className="province" key={x.name || x.cityName} onClick={() => {
        // 表示在省一级
        if (x.name) {
          onChange(x)
        }
      }}>
        <div className={`area ${x.name ? 'active' : ''}`}>
          { x.name || x.cityName }
        </div>
        <div className="confirmed">{ x.confirmedCount }</div>
        <div className="death">{ x.deadCount || "-" }</div>
        <div className="cured">{ x.curedCount || "-" }</div>
      </div>
    ))
  }

  return (
    <>
      <div className="province header">
        <div className="area">地区</div>
        <div className="confirmed">确诊</div>
        <div className="death">死亡</div>
        <div className="cured">治愈</div>
      </div>
      { renderArea() }
    </>
  )
}

function Header ({ province }) {
  return (
    <header>
      <div className="bg"></div>
      <h1>
        <small>新型冠状病毒</small>
        <br />
        疫情实时动态 · { province ? province.name : '省市地图' }
      </h1>
      <i>By 全栈成长之路、Jervon (数据来源于丁香园、卫健委)
      <br/>区县级数据查看：<a href="/zhejiang/ningbo" target="_parent">宁波（点击查看各区）</a>、<a href="/zhejiang/lishui">丽水（点击查看各县）</a></i>
    </header>
  )
}

function App () {
  const [province, _setProvince] = useState(null)
  const setProvinceByUrl = () => {
    // 兼容区/县级
    var p;
    if(_p_array.length > 1){
      p = _p_array[1]
    }else{
      p = _p
    }
    console.log("p2=")
    console.log(p)
    _setProvince(p ? provincesByPinyin[p] : null)
  }

  useEffect(() => {
    setProvinceByUrl()
    window.addEventListener('popstate', setProvinceByUrl)
    return () => {
      window.removeEventListener('popstate', setProvinceByUrl)
    }
  }, [])

  useEffect(() => {
    if (province) {
      window.document.title = `肺炎疫情实时地图 | ${province.name}`
    }
  }, [province])

  const setProvince = (p) => {
    _setProvince(p)
    window.history.pushState(null, null, p ? p.pinyin : '/')
  }

  const setProvince_2 = (p) => {
    _setProvince(p)
    window.history.pushState(null, null, p ? p.pinyin : '/')
    window.location.pathname = "/"
  }

  const data = !province ? provinces.map(p => ({
    name: p.provinceShortName,
    value: p.confirmedCount
  })) : provincesByName[province.name].cities.map(city => ({
    name: city.fullCityName,
    value: city.confirmedCount
  }))

  const area = province ? provincesByName[province.name].cities : provinces
  const overall = province ? province : all

  return (
    <div>
      <Header province={province} />
      <Stat { ...overall } name={province && province.name} modifyTime={all.modifyTime} />
      <div className="card">
        <h2>疫情地图 { province ? `· ${province.name}` : false }
        {
          province && (area_array.indexOf(province.pinyin) == -1) ? <small
            onClick={() => setProvince(null)}
          >返回全国</small> : null
        }

          {
          province && (area_array.indexOf(province.pinyin) > -1) ? <small
            onClick={() => setProvince_2(null)}
          >返回全国</small> : null
        }


        {/* {
          province && (area_array.indexOf(province.pinyin) > -1) ? <small
            onClick={() => setProvince_2(null)}
          >返回全国</small> : null
        } */}

        

        {/* TODO 返回省级 */}
        {/* {
          area_array.indexOf(province.pinyin) > -1 ? "" : ""
        } */}
        
        </h2>
        <Suspense fallback={<div className="loading">地图正在加载中...</div>}>
          
          <Map province={province} data={data} onClick={name => {
            const p = provincesByName[name]
            if (p) {
              setProvince(p)
            }
          }} />
          {
            province ? false :
              <div className="tip">
                在地图中点击省份可跳转到相应省份的疫情地图，并查看该省相关的实时动态
              </div>
          }
        </Suspense>
        <Area area={area} onChange={setProvince} />
      </div>
      <News province={province} />
      <Summary />
      <Fallback />
    </div>
  );


}

export default App;
