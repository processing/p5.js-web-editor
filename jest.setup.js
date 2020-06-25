import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import '@babel/polyfill'
import mongoose from 'mongoose'

mongoose.Promise = global.Promise;

configure({ adapter: new Adapter() })
